import { DOMParser } from 'linkedom';
import { type WebScraper } from './WebScraper';
import { type ChipsetVariant } from '../generated/prisma/client';
import { RAM_LIMITS } from './constant/mac-ram-limits';
import { type MacFamily } from '../schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('EveryMacScraper');

export interface MacSpecification {
  family: string;
  model: string;
  identifier: string;
  chip: string;
  chipVariant: string;
  cpuCores: number;
  gpuCores: number;
  ram: number;
  year: number;
}

class ParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export class EveryMacScraper {
  private readonly dom = new DOMParser();
  private readonly delayBetweenRequests = 1000;

  private readonly Macs: Record<MacFamily, string> = {
    MacBookPro:
      'https://everymac.com/systems/apple/macbook_pro/all-apple-silicon-macbook-pro-models.html',
    iMac: 'https://everymac.com/systems/apple/imac/all-apple-silicon-imac-models.html',
    MacMini:
      'https://everymac.com/systems/apple/mac_mini/all-apple-silicon-mac-mini-models.html',
    MacPro:
      'https://everymac.com/systems/apple/mac_pro/all-apple-silicon-mac-pro-models.html',
    MacStudio:
      'https://everymac.com/systems/apple/mac-studio/index-macstudio.html',
    MacBookAir:
      'https://everymac.com/systems/apple/macbook-air/all-apple-silicon-macbook-air-models.html',
  };

  constructor(private readonly webScraper: WebScraper) {}

  async scrapeAllSpecifications(): Promise<MacSpecification[]> {
    const macEntries = Object.entries(this.Macs);
    const allSpecifications: MacSpecification[] = [];

    logger.log(`Starting to scrape ${macEntries.length} URLs`);

    for (const [index, [familyKey, url]] of macEntries.entries()) {
      try {
        logger.log(`Scraping ${index + 1}/${macEntries.length}: ${familyKey}`);

        const specifications = await this.scrapeUrl(url, familyKey);
        allSpecifications.push(...specifications);

        logger.log(`Found ${specifications.length} specifications`);

        if (index < macEntries.length - 1) {
          await this.delay(this.delayBetweenRequests);
        }
      } catch (error) {
        logger.error(`Failed to scrape ${familyKey}`, error instanceof Error ? error.stack : String(error));
        continue;
      }
    }

    return allSpecifications.filter(
      (spec) => !spec.identifier.includes('(Rack)'),
    );
  }

  private async scrapeUrl(
    url: string,
    familyKey: string,
  ): Promise<MacSpecification[]> {
    const htmlContent = await this.webScraper.fetchPageContent(url);
    const document = this.parseDocument(htmlContent);
    return this.extractSpecifications(document, familyKey);
  }

  private parseDocument(html: string): Document {
    try {
      return this.dom.parseFromString(html, 'text/html') as unknown as Document;
    } catch (error) {
      throw new ParseError('Failed to parse HTML document', error);
    }
  }

  private async extractSpecifications(
    document: Document,
    family: string,
  ): Promise<MacSpecification[]> {
    const specifications: MacSpecification[] = [];
    const wrappers = document.querySelectorAll(
      'span[id*="contentcenter_specs_externalnav_wrapper"]',
    );

    for (const wrapper of wrappers) {
      try {
        const specs = await this.extractSpecificationsFromWrapper(
          wrapper,
          document,
          family,
        );
        specifications.push(
          ...specs.filter((spec) => this.isValidSpecification(spec)),
        );
      } catch (error) {
        logger.warn(`Failed to extract specification from wrapper: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }

    return specifications;
  }

  private async extractSpecificationsFromWrapper(
    wrapper: Element,
    document: Document,
    family: string,
  ): Promise<MacSpecification[]> {
    const titleText = this.extractTitleText(wrapper);
    if (!titleText) return [];

    const specTable = this.findSpecificationTable(wrapper, document);
    if (!specTable) return [];

    const tableData = await this.parseSpecificationTable(specTable);
    const chipInfo = this.parseChipInfo(titleText);

    const baseSpec = {
      family,
      model: this.cleanModelName(titleText),
      identifier: tableData.identifier || '',
      chip: chipInfo.chip,
      chipVariant: chipInfo.variant,
      cpuCores: tableData.cpuCores || 0,
      gpuCores: tableData.gpuCores || 0,
      year: tableData.year || 0,
    };

    if (tableData.ramConfigurations && tableData.ramConfigurations.length > 0) {
      return tableData.ramConfigurations.map((ram) => ({
        ...baseSpec,
        ram,
      }));
    }

    return [
      {
        ...baseSpec,
        ram: tableData.ram || 0,
      },
    ];
  }

  private extractTitleText(wrapper: Element): string | null {
    const titleNav = wrapper.querySelector(
      'span[id*="contentcenter_specs_externalnav_2"]',
    );
    const titleLink = titleNav?.querySelector('a');
    return titleLink?.textContent?.trim() || null;
  }

  private findSpecificationTable(
    wrapper: Element,
    document: Document,
  ): Element | null {
    const titleSpan = wrapper.querySelector(
      'span[id*="contentcenter_specs_externalnav_1"] span[id$="-title"]',
    );
    const titleId = titleSpan?.id;

    if (!titleId) return null;

    const specId = titleId.replace('-title', '');
    const specDiv = document.getElementById(specId);

    return specDiv?.querySelector('table') || null;
  }

  private async getRamCombinations(
    completeSpecsUrl: string,
  ): Promise<number[]> {
    const ramConfigurations: number[] = [];

    try {
      const htmlContent =
        await this.webScraper.fetchPageContent(completeSpecsUrl);
      const doc = this.parseDocument(htmlContent);

      const detailsTables = doc.querySelectorAll(
        '#contentcenter_specs_table_details',
      );
      detailsTables.forEach((detailsTable) => {
        const allText = detailsTable.textContent || '';
        const ramMatches = allText.match(/\b(\d+\s*GB)\b(?=[^.!?]*\bRAM\b)/gi);
        if (ramMatches) {
          ramMatches.forEach((match) => {
            const value = parseInt(match.replace(/[^\d]/g, ''));
            if (value && !ramConfigurations.includes(value)) {
              ramConfigurations.push(value);
            }
          });
        }
      });

      ramConfigurations.sort((a, b) => a - b);

      return ramConfigurations;
    } catch (error) {
      logger.error('Failed to fetch complete specs', error instanceof Error ? error.stack : String(error));
      return [];
    }
  }

  private async parseSpecificationTable(
    table: Element,
  ): Promise<
    Partial<
      MacSpecification & { identifier: string; ramConfigurations?: number[] }
    >
  > {
    const rows = table.querySelectorAll('tr');
    const data: Record<string, string> = {};
    let ramConfigurations: number[] = [];

    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      const completeSpecsLink = row.querySelector('a[href*="specs"]');
      if (
        completeSpecsLink &&
        completeSpecsLink.textContent?.includes('Complete')
      ) {
        const href = completeSpecsLink.getAttribute('href');
        if (href) {
          const completeSpecsUrl = href.startsWith('http')
            ? href
            : `https://everymac.com${href}`;
          ramConfigurations = await this.getRamCombinations(completeSpecsUrl);
        }
      }

      if (cells.length >= 2 && cells.length % 2 === 0) {
        for (let i = 0; i < cells.length; i += 2) {
          const key = cells[i].textContent?.trim().toLowerCase();
          const value = cells[i + 1].textContent?.trim();
          if (key && value) {
            data[key] = value;
          }
        }
      }
    }

    const baseSpec = {
      identifier: data.id?.replace(/[^A-Za-z0-9,]/g, '') || '',
      cpuCores: this.extractNumber(data.cpu, /(\d+)\s+Cores/),
      gpuCores: this.extractNumber(data.gpu, /(\d+)-Core/),
      year: this.extractNumber(data['intro.'], /(\d{4})/),
    };

    if (ramConfigurations.length > 0) {
      return {
        ...baseSpec,
        ramConfigurations,
      };
    }

    return {
      ...baseSpec,
      ram: parseInt(data.ram || '0'),
    };
  }

  private parseChipInfo(titleText: string): {
    chip: string;
    variant: ChipsetVariant;
  } {
    const chipMatch = titleText.match(/"(M\d+)(\s+(Pro|Max|Ultra))?"/i);

    return {
      chip: chipMatch?.[1] || '',
      variant: (chipMatch?.[3]?.toUpperCase() as ChipsetVariant) || 'BASE',
    };
  }

  private extractNumber(text: string | undefined, pattern: RegExp): number {
    if (!text) return 0;
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : 0;
  }

  private cleanModelName(titleText: string): string {
    return titleText.replace(/"/g, '').trim();
  }

  private isValidSpecification(spec: MacSpecification): boolean {
    return (
      Boolean(spec.model && spec.chip) && this.isValidRAMConfiguration(spec)
    );
  }

  private isValidRAMConfiguration(spec: MacSpecification): boolean {
    const familyLimits = RAM_LIMITS[spec.family as MacFamily];
    if (!familyLimits) return true;

    const chipsetLimits = familyLimits[spec.chip as keyof typeof familyLimits];
    if (!chipsetLimits) return true;

    const variantLimit =
      chipsetLimits[spec.chipVariant as keyof typeof chipsetLimits];
    if (!variantLimit) return true;

    return spec.ram <= variantLimit;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

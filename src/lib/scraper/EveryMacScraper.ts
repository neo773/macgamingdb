import { DOMParser } from "linkedom";
import { WebScraper } from "./WebScraper";

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

interface ChipInfo {
  chip: string;
  variant: string;
}

class ParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ParseError";
  }
}

export class EveryMacScraper {
  private readonly dom = new DOMParser();
  private readonly delayBetweenRequests = 1000;

  private readonly Macs = {
    MacBookPro:
      "https://everymac.com/systems/apple/macbook_pro/all-apple-silicon-macbook-pro-models.html",
    iMac: "https://everymac.com/systems/apple/imac/all-apple-silicon-imac-models.html",
    MacMini:
      "https://everymac.com/systems/apple/mac_mini/all-apple-silicon-mac-mini-models.html",
    MacPro:
      "https://everymac.com/systems/apple/mac_pro/all-apple-silicon-mac-pro-models.html",
    MacBookAir:
      "https://everymac.com/systems/apple/macbook-air/all-apple-silicon-macbook-air-models.html",
  };

  constructor(private readonly webScraper: WebScraper) {}

  async scrapeAllSpecifications(): Promise<MacSpecification[]> {
    const macEntries = Object.entries(this.Macs);
    const allSpecifications: MacSpecification[] = [];

    console.log(`🚀 Starting to scrape ${macEntries.length} URLs`);

    for (const [index, [familyKey, url]] of macEntries.entries()) {
      try {
        console.log(
          `📄 Scraping ${index + 1}/${macEntries.length}: ${familyKey}`
        );

        const specifications = await this.scrapeUrl(url, familyKey);
        allSpecifications.push(...specifications);

        console.log(`✅ Found ${specifications.length} specifications`);

        if (index < macEntries.length - 1) {
          await this.delay(this.delayBetweenRequests);
        }
      } catch (error) {
        console.error(`❌ Failed to scrape ${familyKey}:`, error);
        continue;
      }
    }

    return allSpecifications;
  }

  private async scrapeUrl(
    url: string,
    familyKey: string
  ): Promise<MacSpecification[]> {
    const htmlContent = await this.webScraper.fetchPageContent(url);
    const document = this.parseDocument(htmlContent);
    return this.extractSpecifications(document, familyKey);
  }

  private parseDocument(html: string): Document {
    try {
      return this.dom.parseFromString(html, "text/html") as unknown as Document;
    } catch (error) {
      throw new ParseError("Failed to parse HTML document", error);
    }
  }

  private extractSpecifications(
    document: Document,
    family: string
  ): MacSpecification[] {
    const specifications: MacSpecification[] = [];
    const wrappers = document.querySelectorAll(
      'span[id*="contentcenter_specs_externalnav_wrapper"]'
    );

    for (const wrapper of wrappers) {
      try {
        const specification = this.extractSingleSpecification(
          wrapper,
          document,
          family
        );
        if (specification && this.isValidSpecification(specification)) {
          specifications.push(specification);
        }
      } catch (error) {
        console.warn("Failed to extract specification from wrapper:", error);
        continue;
      }
    }

    return specifications;
  }

  private extractSingleSpecification(
    wrapper: Element,
    document: Document,
    family: string
  ): MacSpecification | null {
    const titleText = this.extractTitleText(wrapper);
    if (!titleText) return null;

    const specTable = this.findSpecificationTable(wrapper, document);
    if (!specTable) return null;

    const tableData = this.parseSpecificationTable(specTable);
    const chipInfo = this.parseChipInfo(titleText);

    return {
      family,
      model: this.cleanModelName(titleText),
      identifier: tableData.identifier || "",
      chip: chipInfo.chip,
      chipVariant: chipInfo.variant,
      cpuCores: tableData.cpuCores || 0,
      gpuCores: tableData.gpuCores || 0,
      ram: tableData.ram || 0,
      year: tableData.year || 0,
    };
  }

  private extractTitleText(wrapper: Element): string | null {
    const titleNav = wrapper.querySelector(
      'span[id*="contentcenter_specs_externalnav_2"]'
    );
    const titleLink = titleNav?.querySelector("a");
    return titleLink?.textContent?.trim() || null;
  }

  private findSpecificationTable(
    wrapper: Element,
    document: Document
  ): Element | null {
    const titleSpan = wrapper.querySelector(
      'span[id*="contentcenter_specs_externalnav_1"] span[id$="-title"]'
    );
    const titleId = titleSpan?.id;

    if (!titleId) return null;

    const specId = titleId.replace("-title", "");
    const specDiv = document.getElementById(specId);

    return specDiv?.querySelector("table") || null;
  }

  private parseSpecificationTable(
    table: Element
  ): Partial<MacSpecification & { identifier: string }> {
    const rows = table.querySelectorAll("tr");
    const data: Record<string, string> = {};

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2 && cells.length % 2 === 0) {
        for (let i = 0; i < cells.length; i += 2) {
          const key = cells[i].textContent?.trim().toLowerCase();
          const value = cells[i + 1].textContent?.trim();
          if (key && value) {
            data[key] = value;
          }
        }
      }
    });

    return {
      identifier: data.id,
      cpuCores: this.extractNumber(data.cpu, /(\d+)\s+Cores/),
      gpuCores: this.extractNumber(data.gpu, /(\d+)-Core/),
      ram: parseInt(data.ram || "0"),
      year: this.extractNumber(data["intro."], /(\d{4})/),
    };
  }

  private parseChipInfo(titleText: string): ChipInfo {
    const chipMatch = titleText.match(/"(M\d+)(\s+(Pro|Max|Ultra))?"/i);

    return {
      chip: chipMatch?.[1] || "",
      variant: chipMatch?.[3]?.toLowerCase() || "base",
    };
  }

  private extractNumber(text: string | undefined, pattern: RegExp): number {
    if (!text) return 0;
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : 0;
  }

  private cleanModelName(titleText: string): string {
    return titleText.replace(/"/g, "").trim();
  }

  private isValidSpecification(spec: MacSpecification): boolean {
    return Boolean(spec.model && spec.chip);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export type SteamAppData = {
  type: string;
  name: string;
  steam_appid: number;
  required_age: string;
  is_free: boolean;
  controller_support: string;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string;
  pc_requirements: {
    minimum: string;
    recommended: string;
  };
  mac_requirements: {
    minimum: string;
    recommended: string;
  };
  linux_requirements: {
    minimum: string;
    recommended: string;
  };
  legal_notice: string;
  ext_user_account_notice: string;
  developers: Array<string>;
  publishers: Array<string>;
  price_overview: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  packages: Array<number>;
  package_groups: Array<{
    name: string;
    title: string;
    description: string;
    selection_text: string;
    save_text: string;
    display_type: number;
    is_recurring_subscription: string;
    subs: Array<{
      packageid: number;
      percent_savings_text: string;
      percent_savings: number;
      option_text: string;
      option_description: string;
      can_get_free_license: string;
      is_free_license: boolean;
      price_in_cents_with_discount: number;
    }>;
  }>;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories: Array<{
    id: number;
    description: string;
  }>;
  genres: Array<{
    id: string;
    description: string;
  }>;
  screenshots: Array<{
    id: number;
    path_thumbnail: string;
    path_full: string;
  }>;
  recommendations: {
    total: number;
  };
  achievements: {
    total: number;
    highlighted: Array<{
      name: string;
      path: string;
    }>;
  };
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  support_info: {
    url: string;
    email: string;
  };
  background: string;
  background_raw: string;
  content_descriptors: {
    ids: Array<number>;
    notes: string;
  };
  ratings: {
    esrb: {
      rating: string;
      descriptors: string;
      required_age: string;
      use_age_gate: string;
    };
    pegi: {
      rating: string;
      descriptors: string;
      use_age_gate: string;
      required_age: string;
    };
    usk: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    oflc: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    nzoflc: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    kgrb: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    dejus: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    fpb: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    csrr: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    steam_germany: {
      rating_generated: string;
      rating: string;
      required_age: string;
      banned: string;
      use_age_gate: string;
      descriptors: string;
    };
  };
};

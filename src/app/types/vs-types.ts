export class VSFilterBody {
  constructor() {
    const themeFilter = new VSCriteria;
    themeFilter.filterType = 5;
    themeFilter.value = "themes";

    const vscodeFilter = new VSCriteria;
    vscodeFilter.filterType = 8;
    vscodeFilter.value = "Microsoft.VisualStudio.Code";

    const defaultFilter = new VSCriteria;
    defaultFilter.filterType = 12;
    defaultFilter.value = "4096";

    const empty = new VSFilters;
    this.filters.push(empty);
    this.filters[0].criteria.push(themeFilter, vscodeFilter, defaultFilter);
    this.flags = 950;
  }

  addFilter(filter: VSCriteria) {
    for (let c of this.filters[0].criteria) {
      if (c.filterType === filter.filterType) {
        c.value = filter.value;
        return;
      }
    }

    this.filters[0].criteria.push(filter);
  }

  addSearchFilter(filterFor: string) {
    const newFilter = new VSCriteria;
    newFilter.filterType = 10;
    newFilter.value = filterFor;
    this.addFilter(newFilter);
  }

  filters: VSFilters[] = [];
  assetTypes: any[] = [];
  flags?: number;
}

export class VSFilters {
  criteria: VSCriteria[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  sortBy: number = 0;
  sortOrder: number = 0;
}

export class VSCriteria {
  filterType!: number;
  value!: string;
};

export class VSResultBody {
  results: VSResult[] = [];

  findInExtensions(query: string) : VSExtension | null {
    for (const ext of this.results[0].extensions) {
      if (ext.displayName === query)
        return ext;
    }

    return null;
  };
}

export class VSResult {
  extensions: VSExtension[] = [];
  pagingToken: any;
  resultMetadata: VSExtensionMetadataBody[] = [];
}

export class VSExtension {
  publisher!: VSExtensionPublisherInfo;
  extensionId!: string;
  extensionName!: string;
  displayName!: string;
  flags!: string;
  lastUpdated!: string;
  publishedDate!: string;
  releaseDate!: string;
  shortDescription!: string;
  versions: VSExtensionVersions[] = [];
  categories: string[] = [];
  tags: string[] = [];
  statistics: VSExtensionStat[] = [];
  deploymentType!: number;

  // extensionIcon is not included in the response from VS. The icon is downloaded via a GET and the Base64 string is saved here.
  // For convenience extensionIcon may be set to a boolean false value to indicate that there is no extensionIcon
  extensionIcon?: string | boolean;
}

export class VSExtensionPublisherInfo {
  publisherId!: string;
  publisherName!: string;
  displayName!: string;
  flags!: string;
  domain!: any;
  isDomainVerified!: boolean
}

export class VSExtensionVersions {
  version!: string;
  flags!: string;
  lastUpdated!: string;
  files!: VSExtensionVersionFiles[];
  properties?: VSExtensionVersionProps[];
  assetUri?: string;
  fallbackAssetUri?: string;
}

export class VSExtensionVersionFiles {
  assetType!: string;
  source!: string;
}

export class VSExtensionVersionProps {
  key!: string;
  value: string = "";
}

export class VSExtensionStat {
  statisticName!: string;
  value!: number;
}

export class VSExtensionMetadataBody {
  metadataType!: string;
  metadataItems: VSExtensionMetadataItem[] = [];
}

export class VSExtensionMetadataItem {
  name!: string;
  count!: number;
}
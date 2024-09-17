export class VSFilterBody {
  constructor() {
    const themeFilter: VSCriteria = { filterType: 5, value: "themes" };
    const vscodeFilter: VSCriteria = { filterType: 8, value: "Microsoft.VisualStudio.Code" }
    const defaultFilter: VSCriteria = { filterType: 12, value: "4096" }

    const empty = new VSFilters;
    this.filters.push(empty);
    this.filters[0].criteria.push(themeFilter, vscodeFilter, defaultFilter);
    this.flags = 950;
  }

  addFilter(filter: VSCriteria) {
    for (const c of this.filters[0].criteria) {
      if (c.filterType === filter.filterType) {
        c.value = filter.value;
        return;
      }
    }

    this.filters[0].criteria.push(filter);
  }

  addSearchFilter(filterFor: string) {
    const newFilter: VSCriteria = { filterType: 10, value: filterFor };
    this.addFilter(newFilter);
  }

  filters: VSFilters[] = [];
  assetTypes: unknown[] = [];
  flags?: number;
}

export class VSFilters {
  criteria: VSCriteria[] = [];
  pageNumber: number = 1;
  pageSize: number = 20;
  sortBy: number = 0;
  sortOrder: number = 0;
}

/*
FilterType is not documented. Known filter types are:

5: Category name
8: Platform name
10: Filter value
12: Unknown - always set to 4096 by VS Code

*/
export interface VSCriteria {
  filterType: number;
  value: string;
};

export interface VSResultBody {
  results: VSResult[];
}

export interface VSResult {
  extensions: VSExtension[];
  pagingToken: unknown;
  resultMetadata: VSExtensionMetadataBody[];
}

export interface VSExtension {
  publisher: VSExtensionPublisherInfo;
  extensionId: string;
  extensionName: string;
  displayName: string;
  flags: string;
  lastUpdated: string;
  publishedDate: string;
  releaseDate: string;
  shortDescription: string;
  versions: VSExtensionVersions[];
  categories: string[];
  tags: string[];
  statistics: VSExtensionStat[];
  deploymentType: number;

  // extensionIcon is not included in the response from VS. The icon is downloaded via a GET and the Base64 string is saved here.
  // For convenience extensionIcon may be set to a boolean false value to indicate that there is no extensionIcon
  extensionIcon?: string | boolean;
}

export interface VSExtensionPublisherInfo {
  publisherId: string;
  publisherName: string;
  displayName: string;
  flags: string;
  domain: unknown;
  isDomainVerified: boolean
}

export interface VSExtensionVersions {
  version: string;
  flags: string;
  lastUpdated: string;
  files: VSExtensionVersionFiles[];
  properties?: VSExtensionVersionProps[];
  assetUri?: string;
  fallbackAssetUri?: string;
}

export interface VSExtensionVersionFiles {
  assetType: string;
  source: string;
}

export interface VSExtensionVersionProps {
  key: string;
  value: string;
}

export interface VSExtensionStat {
  statisticName: string;
  value: number;
}

export interface VSExtensionMetadataBody {
  metadataType: string;
  metadataItems: VSExtensionMetadataItem[];
}

export interface VSExtensionMetadataItem {
  name: string;
  count: number;
}
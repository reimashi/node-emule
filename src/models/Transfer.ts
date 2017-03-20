export enum DownloadState {
    Downloaded,
    NoFonts,
    FewSources,
    ManySources,
    Checking
}

export enum TransferPriority {
    Auto,
    High,
    Normal,
    Low
}

export class Transfer {
    name: string;
    hash: string;
    partFile: number;
    size: number = 0;
    downloaded: number = 0;
    downloadedMap: [ DownloadState ];
    downloadSpeed: number = 0;
    sourcesConnected: number = 0;
    sourcesDownloading: number = 0;
    sourcesAvailable: number = 0;
    priority: TransferPriority;
    category: string;
}
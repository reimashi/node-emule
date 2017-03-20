export class CommonParser {
    static parseByteSize(sizeStr: string) : number {
        var size: number = Number(sizeStr.substring(0, sizeStr.indexOf(" ")));
        if (isNaN(size)) size = 0;

        switch(sizeStr.substring(sizeStr.indexOf(" ") + 1).toUpperCase()) {
            case "TB": size *= 1024;
            case "GB": size *= 1024;
            case "MB": size *= 1024;
            case "KB": size *= 1024;
        }

        return Math.round(size);
    }
}
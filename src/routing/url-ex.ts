export class UrlEx extends URL {
    public fileExtension: string = "";
    public pathTokens: string[] = [];

    constructor(url: string, base?: string | URL | undefined) {
        super(url, base);

        this.pathTokens = this.pathname.split("/").filter((x) => x).map((x) => decodeURIComponent(x));

        if (this.pathTokens.length) {
            const lastElement = this.pathTokens[this.pathTokens.length - 1];

            if (lastElement.indexOf(".") !== -1) {
                const tokens = lastElement.split(".").map((x) => x.trim());

                this.pathTokens[this.pathTokens.length - 1] = tokens[0];
                this.fileExtension = tokens[1];
            }
        }
    }
}

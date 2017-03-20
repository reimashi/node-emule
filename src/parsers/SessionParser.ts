import * as Cheerio from 'cheerio';

export class SessionParser {
    static parseSession(html: string) : number {
        var $ = Cheerio.load(html);
        var id = Number($("form > input[name='ses']").val());
        return isNaN(id) ? null : id;
    }
}
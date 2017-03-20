import * as Cheerio from 'cheerio';
import { Transfer, TransferPriority } from "../models/Transfer";
import { CommonParser } from "./CommonParser";
import {SearchResult} from "../models/SearchResult";
var Entities = require("entities");

export class SearchParser {
    static parseSearchResult(html: string) : SearchResult[] {
        const searchRegex = /searchmenu\(event,'(ed2k:\/\/\|file\|(.*)\|([0-9]*)\|([0-9A-f]{32})\|\/)'\)/;
        var $ = Cheerio.load(html);
        var results: SearchResult[] = [];

        $("table tr:has(td[class^='search-line'])").each((index, element) => {
            var currentSearch: SearchResult = new SearchResult();

            var regexResult = Entities.decodeHTML($(element).html()).match(searchRegex);
            if (regexResult != null) {
                currentSearch.ed2k = regexResult[1];
                currentSearch.name = regexResult[2];
                currentSearch.size = Number(regexResult[3]);
                currentSearch.hash = regexResult[4];

                $(element).children("td[class^='search-line']").each((rowIndex, rowElement) => {
                    switch (rowIndex) {
                        case 3:
                            var tHtml = Entities.decodeHTML($(rowElement).find("font").html());
                            currentSearch.sourcesAvailable = Number(tHtml.substring(0, tHtml.indexOf("(")));
                            currentSearch.sourcesComplete = Number(tHtml.substring(tHtml.indexOf("(") + 1, tHtml.indexOf(")")));
                    }
                });
            }

            if (currentSearch.name != null) results.push(currentSearch);
        });

        return results;
    }
}
import * as Cheerio from 'cheerio';
import { Transfer, TransferPriority } from "../models/Transfer";
import { CommonParser } from "./CommonParser";
var Entities = require("entities");

export class TransferParser {
    static parseTransfer(html: string) : Transfer[] {
        const partMetRegex = /([0-9]*)\.part\.met/g;
        const priorityRegex = /'(Auto|High|Low|Normal)?'/g;

        var $ = Cheerio.load(html);
        var transfers: Transfer[] = [];

        $("table[bgcolor=#99CCFF] tr:has(td[class^='down-line-'])").each((index, element) => {
            var currentTransfer: Transfer = new Transfer();

            $(element).children("td[class^='down-line-']").each((rowIndex, rowElement) => {
                switch (rowIndex) {
                    case 0:
                        var tHtml = Entities.decodeHTML($(rowElement).find("table td:nth-child(5) div").html());
                        currentTransfer.name = tHtml.substring(0, tHtml.indexOf("<br>")).trim();
                        currentTransfer.hash = tHtml.substring(tHtml.indexOf("<br>") + 4);
                        currentTransfer.hash = currentTransfer.hash.substring(currentTransfer.hash.indexOf(":") + 1, currentTransfer.hash.indexOf("<br>")).trim();
                        var partReg = partMetRegex.exec(tHtml);
                        if (partReg) currentTransfer.partFile = Number(partReg[1]);
                        break;
                    case 1: currentTransfer.size = CommonParser.parseByteSize($(rowElement).html()); break;
                    case 2: currentTransfer.downloaded = CommonParser.parseByteSize($(rowElement).html()); break;
                    /*case 3:
                        currentTransfer.por = [];
                        $(rowElement).find("img").each((percIndex, percElement) => {
                            currentTransfer.por.push(Number($(percElement).attr("width")));
                        });*/
                    case 4:
                        var nHtml = Number($(rowElement).html());
                        currentTransfer.downloadSpeed = isNaN(nHtml) ? 0 : nHtml * 1000;
                        break;
                    case 5:
                        var tHtml = Entities.decodeHTML($(rowElement).html());
                        if (tHtml == "-") {
                            currentTransfer.sourcesConnected = 0;
                            currentTransfer.sourcesAvailable = 0;
                            currentTransfer.sourcesDownloading = 0;
                        }
                        else {
                            currentTransfer.sourcesConnected = Number(tHtml.substring(0, tHtml.indexOf("/")));
                            currentTransfer.sourcesAvailable = Number(tHtml.substring(tHtml.indexOf("/") + 1, tHtml.indexOf("(")));
                            currentTransfer.sourcesAvailable = isNaN(currentTransfer.sourcesAvailable) ? 0 : currentTransfer.sourcesAvailable;
                            currentTransfer.sourcesDownloading = Number(tHtml.substring(tHtml.indexOf("(") + 1, tHtml.indexOf(")")));
                        }
                        break;
                    case 6:
                        var prioReg = priorityRegex.exec($(rowElement).find("a").attr("onmouseover"));
                        if (prioReg) {
                            switch (prioReg[1].toLowerCase()) {
                                case "high": currentTransfer.priority = TransferPriority.High; break;
                                case "normal": currentTransfer.priority = TransferPriority.Normal; break;
                                case "low": currentTransfer.priority = TransferPriority.Low; break;
                                default: currentTransfer.priority = TransferPriority.Auto; break;
                            }
                        }
                        else {
                            currentTransfer.priority = TransferPriority.Auto;
                        }
                        break;
                    case 7:
                        currentTransfer.category = $(rowElement).find("a").html().trim(); break;
                }
            });

            if (currentTransfer.name != null) transfers.push(currentTransfer);
        });

        return transfers;
    }
}
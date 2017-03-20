/// <reference path="../typings/index.d.ts"/>

import * as Request from 'request';

import { Transfer } from "./models/Transfer";
import { SearchResult } from "./models/SearchResult";
import * as Parsers from "./parsers/Parsers";
import {SearchConfig} from "./models/SearchConfig";
import {SearchProtocol} from "./models/SearchProtocol";

export class EmuleAPI {
    private sessionId: number = null;
    private url: string;
    private password: string = "";

    private static searching: boolean = false;

    constructor(url: string = "http://localhost", password: string = "", port: number = 4711) {
        this.url = url + ":" + port;
        this.password = password;
    }

    async getSessionId(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            Request.post(this.url, {
                form: {
                    p: this.password,
                    w: "password"
                }
            }, (error, response, body) => {
                if (error) reject(error);
                else if (response.statusCode != 200) reject(error);
                else {
                    this.sessionId = Parsers.SessionParser.parseSession(body);
                    resolve(this.sessionId);
                }
            });
        });
    }

    async getTransfers(): Promise<Transfer[]> {
        if (this.sessionId == null) { await this.getSessionId(); }

        return new Promise<Transfer[]>((resolve, reject) => {
            Request.get(this.url + "?ses=" + this.sessionId + "&w=transfer", (error, response, body) => {
                if (error) reject(error);
                else if (response.statusCode != 200) reject(error);
                else resolve(Parsers.TransferParser.parseTransfer(body));
            });
        });
    }

    async search(config: SearchConfig, limitTime: number = 15): Promise<SearchResult[]> {
        if (this.sessionId == null) { await this.getSessionId(); }
        var now = new Date();

        return new Promise<SearchResult[]>((resolve, reject) => {
            if (EmuleAPI.searching) reject("Other search is in progress");
            else {
                EmuleAPI.searching = true;

                var searchUrl = this.url + "?ses=" + this.sessionId + "&w=search&unicode=on&tosearch=" + config.name + "&min=" + config.minSize;
                if (config.searchProtocol == SearchProtocol.KAD) searchUrl += "&method=kademlia";
                if (config.searchProtocol == SearchProtocol.All) searchUrl += "&method=global";
                if (config.searchProtocol == SearchProtocol.Edonkey_Server) searchUrl += "&method=server";
                if (config.maxSize > 0) searchUrl += "&max=" + config.maxSize;

                Request.get(searchUrl, (sError, sResponse, sBody) => {
                    if (sError) { reject(sError); EmuleAPI.searching = false; }
                    else if (sResponse.statusCode != 200) { reject(sError); EmuleAPI.searching = false; }
                    else {
                        setTimeout(() => {
                            Request.get(this.url + "?ses=" + this.sessionId + "&w=search", (error, response, body) => {
                                EmuleAPI.searching = false;
                                if (error) reject(error);
                                else if (response.statusCode != 200) reject(error);
                                else resolve(Parsers.SearchParser.parseSearchResult(body));
                            });
                        }, limitTime * 1000);
                    }
                });
            }
        });
    }
}
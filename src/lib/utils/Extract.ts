import * as websocket from "websocket";
import * as threading from "threading";

class Utils {
  static rangeCorrector(ranges: number[][]): number[][] {
    if (!ranges.some((range) => range[0] === 0 && range[1] === 99)) {
      ranges.unshift([0, 99]);
    }
    return ranges;
  }

  static getRanges(
    index: number,
    multiplier: number,
    memberCount: number,
  ): number[][] {
    const initialNum: number = Math.floor(index * multiplier);
    let rangesList: number[][] = [[initialNum, initialNum + 99]];

    if (memberCount > initialNum + 99) {
      rangesList.push([initialNum + 100, initialNum + 199]);
    }

    return Utils.rangeCorrector(rangesList);
  }

  static parseGuildMemberListUpdate(response: any): any {
    let memberdata: any = {
      online_count: response["d"]["online_count"],
      member_count: response["d"]["member_count"],
      id: response["d"]["id"],
      guild_id: response["d"]["guild_id"],
      hoisted_roles: response["d"]["groups"],
      types: [],
      locations: [],
      updates: [],
    };

    for (let chunk of response["d"]["ops"]) {
      memberdata["types"].push(chunk["op"]);

      if (["SYNC", "INVALIDATE"].includes(chunk["op"])) {
        memberdata["locations"].push(chunk["range"]);

        if (chunk["op"] === "SYNC") {
          memberdata["updates"].push(chunk["items"]);
        } else {
          memberdata["updates"].push([]);
        }
      } else if (["INSERT", "UPDATE", "DELETE"].includes(chunk["op"])) {
        memberdata["locations"].push(chunk["index"]);

        if (chunk["op"] === "DELETE") {
          memberdata["updates"].push([]);
        } else {
          memberdata["updates"].push(chunk["item"]);
        }
      }
    }

    return memberdata;
  }
}

class DiscordSocket extends websocket.WebSocketApp {
  token: string;
  guild_id: string;
  channel_id: string;
  socket_headers: Record<string, string>;
  endScraping: boolean;
  guilds: Record<string, any>;
  members: Record<string, any>;
  ranges: number[][];
  lastRange: number;
  packets_recv: number;

  constructor(token: string, guild_id: string, channel_id: string) {
    super("wss://gateway.discord.gg/?encoding=json&v=9", {
      header: {
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-WebSocket-Extensions":
          "permessage-deflate; client_max_window_bits",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
      },
      on_open: (ws: any) => this.sock_open(ws),
      on_message: (ws: any, msg: string) => this.sock_message(ws, msg),
      on_close: (ws: any, close_code: number, close_msg: string) =>
        this.sock_close(ws, close_code, close_msg),
    });

    this.token = token;
    this.guild_id = guild_id;
    this.channel_id = channel_id;
    this.rbs = rbs;
    this.socket_headers = {
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
    };

    this.endScraping = false;
    this.guilds = {};
    this.members = {};
    this.ranges = [[0, 0]];
    this.lastRange = 0;
    this.packets_recv = 0;
  }

  run(): Record<string, any> {
    this.run_forever();
    return this.members;
  }

  scrapeUsers(): void {
    if (!this.endScraping) {
      this.send(
        '{"op":14,"d":{"guild_id":"' +
          this.guild_id +
          '","typing":true,"activities":true,"threads":true,"channels":{"' +
          this.channel_id +
          '":' +
          JSON.stringify(this.ranges) +
          "}}}",
      );
    }
  }

  sock_open(ws: any): void {
    this.send(
      '{"op":2,"d":{"token":"' +
        this.token +
        '","capabilities":125,"properties":{"os":"Windows","browser":"Firefox","device":"","system_locale":"it-IT","browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0","browser_version":"94.0","os_version":"10","referrer":"","referring_domain":"","referrer_current":"","referring_domain_current":"","release_channel":"stable","client_build_number":103981,"client_event_source":null},"presence":{"status":"online","since":0,"activities":[],"afk":false},"compress":false,"client_state":{"guild_hashes":{},"highest_last_message_id":"0","read_state_version":0,"user_guild_settings_version":-1,"user_settings_version":-1}}}',
    );
  }

  heartbeatThread(interval: number): void {
    try {
      while (true) {
        this.send('{"op":1,"d":' + String(this.packets_recv) + "}");
        time.sleep(interval);
      }
    } catch (e) {
      return;
    }
  }

  sock_message(ws: any, message: string): void {
    const decoded = JSON.parse(message);
    const ids_scraped = Object.keys(this.members).length;

    if (decoded === null) {
      return;
    }

    if (decoded.op !== 11) {
      this.packets_recv += 1;
    }

    if (decoded.op === 10) {
      threading
        .Thread(
          (target = this.heartbeatThread),
          (args = decoded.d.heartbeat_interval / 1000),
          (daemon = true),
        )
        .start();
    }

    if (decoded.t === "READY") {
      for (let guild of decoded.d.guilds) {
        this.guilds[guild.id] = {
          member_count: guild.member_count,
        };
      }
    }

    if (decoded.t === "READY_SUPPLEMENTAL") {
      this.ranges = Utils.getRanges(
        0,
        100,
        this.guilds[this.guild_id].member_count,
      );
      this.scrapeUsers();
    } else if (decoded.t === "GUILD_MEMBER_LIST_UPDATE") {
      const parsed = Utils.parseGuildMemberListUpdate(decoded);

      if (
        parsed.guild_id === this.guild_id &&
        (parsed.types.includes("SYNC") || parsed.types.includes("UPDATE"))
      ) {
        for (let elem in parsed.types) {
          if (elem === "SYNC") {
            if (parsed.updates[elem].length === 0) {
              this.endScraping = true;
              break;
            }

            for (let item of parsed.updates[elem]) {
              if ("member" in item) {
                const BADGES = {
                  "Discord Employee": 1 << 0,
                  "Partnered Server Owner": 1 << 1,
                  "HypeSquad Events": 1 << 2,
                  "Bug Hunter Level 1": 1 << 3,
                  "Early Supporter": 1 << 9,
                  "Team User": 1 << 10,
                  "Bug Hunter Level 2": 1 << 14,
                  "Early Verified Bot Developer": 1 << 17,
                  "Discord Certified Moderator": 1 << 18,
                };

                let badges = [];
                const mem = item.member;
                const obj = {
                  tag: mem.user.username + "#" + mem.user.discriminator,
                  id: mem.user.id,
                };

                const flags = mem.user.public_flags;
                for (let [badge_name, badge_flag] of Object.entries(BADGES)) {
                  if ((flags & badge_flag) === badge_flag) {
                    badges.push(badge_name);
                  }
                }

                if (this.rbs) {
                  if (badges.length > 0) {
                    this.members[mem.user.id] = obj;
                    this.members[mem.user.id]["badges"] = badges;
                  }
                } else {
                  this.members[mem.user.id] = obj;
                }
              } else if (elem === "UPDATE") {
                for (let item of parsed.updates[elem]) {
                  if ("member" in item) {
                    const BADGES = {
                      "Discord Employee": 1 << 0,
                      "Partnered Server Owner": 1 << 1,
                      "HypeSquad Events": 1 << 2,
                      "Bug Hunter Level 1": 1 << 3,
                      "Early Supporter": 1 << 9,
                    };

                    let badges = [];
                    const mem = item.member;
                    const obj = {
                      tag: mem.user.username + "#" + mem.user.discriminator,
                      id: mem.user.id,
                    };
                    const flags = mem.user.public_flags;
                    for (let [badge_name, badge_flag] of Object.entries(
                      BADGES,
                    )) {
                      if ((flags & badge_flag) === badge_flag) {
                        badges.push(badge_name);
                      }
                    }

                    if (this.rbs) {
                      if (badges.length > 0) {
                        this.members[mem.user.id] = obj;
                        this.members[mem.user.id]["badges"] = badges;
                      }
                    } else {
                      this.members[mem.user.id] = obj;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (this.endScraping) {
        this.close();
      }
    }
  }
}

function Scrape(token: string, guild_id: string, channel_id: string): any {
  const sb: DiscordSocket = new DiscordSocket(token, guild_id, channel_id);
  return sb.run();
}
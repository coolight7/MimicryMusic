// ignore_for_file: file_names, camel_case_types, non_constant_identifier_names, constant_identifier_names

import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:mymusic/components/global/MyImage.dart';
import 'package:mymusic/components/global/MyPopup.dart';
import 'package:mymusic/plugin/bili/BilibiliEntity.dart';
import 'package:mymusic/util/MyLogger.dart';
import 'package:mymusic/util/MyNetwork.dart';
import 'package:mymusic/util/MyParse.dart';
import 'package:mymusic/util/MySrc.dart';

class _BiliWbi_c {
  static const mixinKeyEncTab = [
    46,
    47,
    18,
    2,
    53,
    8,
    23,
    32,
    15,
    50,
    10,
    31,
    58,
    3,
    45,
    35,
    27,
    43,
    5,
    49,
    33,
    9,
    42,
    19,
    29,
    28,
    14,
    39,
    12,
    38,
    41,
    13,
    37,
    48,
    7,
    16,
    24,
    55,
    40,
    61,
    26,
    17,
    0,
    1,
    60,
    51,
    30,
    4,
    22,
    25,
    54,
    21,
    56,
    59,
    6,
    63,
    57,
    62,
    11,
    36,
    20,
    34,
    44,
    52
  ];

  String imgKey = "";
  String subKey = "";
  String mixinKey = "";

  /// 更新信息的时间
  int dayTime = 0;

  bool isAvailable() => (imgKey.isNotEmpty && dayTime == DateTime.now().day);
}

class _BiliCookies_c {
  int millisecondExpires = 0;
  final cookies = <Cookie>[];

  _BiliCookies_c();

  bool isAvailable() {
    return (DateTime.now().millisecondsSinceEpoch < millisecondExpires);
  }

  /// 刷新cookie，部分接口可能需要验证cookie
  Future<bool> flushCookies({
    bool doErrTip = true,
  }) async {
    if (isAvailable()) {
      return true;
    }
    cookies.clear();
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_home,
      headerType: MyBiliHeaders_e.None,
      doErrTip: doErrTip,
    );
    if (null != resp && 200 == resp.statusCode) {
      resp.headers.forEach((name, values) {
        if (name.isCaseInsensitiveContains('Set-Cookie')) {
          // 提取cookie
          for (int i = 0; i < values.length; ++i) {
            final item = Cookie.fromSetCookieValue(values[i]);
            cookies.add(item);
            if (null != item.expires) {
              millisecondExpires = item.expires?.millisecondsSinceEpoch ?? 0;
            }
          }
        }
      });
      return true;
    }
    return false;
  }

  String? getString() {
    if (cookies.isEmpty) {
      return null;
    }
    var reStr = "${cookies.first.name}=${cookies.first.value}";
    for (var item in cookies) {
      reStr += "; ${item.name}=${item.value}";
    }
    return reStr;
  }
}

class MyBiliPlugin_c {
  static final _instance = MyBiliPlugin_c();

  static MyBiliPlugin_c to() => _instance;

  final wbi_img = _BiliWbi_c();
  final cookies = _BiliCookies_c();

  MyBiliPlugin_c();

  /// 刷新wbi令牌
  Future<bool> flushWbi({
    bool doErrTip = true,
  }) async {
    if (wbi_img.isAvailable()) {
      return true;
    }
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_nav,
      doErrTip: doErrTip,
    );
    if (null != resp && 200 == resp.statusCode && null != resp.data["data"]) {
      final data = resp.data["data"];
      final wbi = data["wbi_img"];
      if (null != wbi) {
        try {
          String imgKey = wbi["img_url"];
          String subKey = wbi["sub_url"];
          wbi_img.imgKey =
              imgKey.substring(imgKey.lastIndexOf('/') + 1).split('.')[0];
          wbi_img.subKey =
              subKey.substring(imgKey.lastIndexOf('/') + 1).split('.')[0];
          final key = wbi_img.imgKey + wbi_img.subKey;
          String temp = "";
          for (final n in _BiliWbi_c.mixinKeyEncTab) {
            temp += key[n];
          }
          wbi_img.mixinKey = temp.substring(0, 32);
          wbi_img.dayTime = DateTime.now().day;
          return true;
        } catch (e) {
          MyLogger.to().severe(MyLogItem(
            prefix: "flushWbi 失败",
            msg: [e.toString()],
          ));
        }
      }
    }
    return false;
  }

  /// bili 参数签名
  Future<String?> encodeWbiQuery(
    Map<String, dynamic> params, {
    bool doErrTip = true,
  }) async {
    /// 刷新wbi 密钥
    if (await flushWbi(doErrTip: doErrTip)) {
      final int currTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      params.addAll({"wts": currTime});
      final query = <String, dynamic>{};
      final relist = params.entries.toList();
      relist.sort((a, b) => a.key.compareTo(b.key));
      for (final item in relist) {
        query.addAll({item.key: item.value});
      }
      final queryStr = Transformer.urlEncodeQueryMap(query);
      final wbi_sign =
          md5.convert((queryStr + wbi_img.mixinKey).codeUnits).toString();
      return "$queryStr&w_rid=$wbi_sign";
    }
    return null;
  }

  /// 获取b站视频信息
  Future<BiliVideoInfoEntity_c?> getBiliInfo(
    String in_bvid, {
    bool doErrTip = true,
  }) async {
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_view,
      queryParameters: {"bvid": in_bvid},
      doErrTip: doErrTip,
    );
    if (null != resp && 200 == resp.statusCode && null != resp.data["data"]) {
      return BiliVideoInfoEntity_c.fromJson(resp.data["data"]);
    } else {
      return null;
    }
  }

  // 获取一个bili的收藏夹基本信息
  Future<BiliStarFolderEntity_c?> getBiliStarListInfo(
    String media_id, {
    bool doErrTip = true,
  }) async {
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_getStarFolderInfo,
      queryParameters: {
        "media_id": media_id,
      },
      doErrTip: doErrTip,
    );
    if (null != resp && 200 == resp.statusCode && null != resp.data["data"]) {
      final json = resp.data["data"];
      return BiliStarFolderEntity_c(
        id: json["id"] ?? -1,
        fid: json["fid"] ?? -1,
        count: json["media_count"] ?? 0,
        title: json["title"] ?? "",
        depict: json["intro"] ?? "",
      );
    }
    return null;
  }

  Future<List<BiliStarFolderEntity_c>?> getBiliUserStarListInfo(
    String uid, {
    bool doErrTip = true,
  }) async {
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_getUserStarFolders,
      queryParameters: {
        "up_mid": uid,
      },
      headerType: MyBiliHeaders_e.Space,
      doErrTip: doErrTip,
    );
    if (null != resp && 200 == resp.statusCode && null != resp.data["data"]) {
      final relist = <BiliStarFolderEntity_c>[];
      final json = resp.data["data"];
      final int count = json["count"] ?? 0;
      final List inlist = json["list"] ?? [];
      for (int i = 0, len = count; i < len; ++i) {
        final item = inlist[i];
        relist.add(BiliStarFolderEntity_c(
          id: item["id"] ?? -1,
          fid: item["fid"] ?? -1,
          count: item["media_count"] ?? 0,
          title: item["title"] ?? "",
        ));
      }
      return relist;
    }
    return null;
  }

  Future<List<BiliVideoInfoEntity_c>?> getBiliStarlistVideo(
    BiliStarFolderEntity_c info, {
    bool doErrTip = true,
  }) async {
    if (info.id >= 0) {
      // 单次分页请求获取的最大数量
      const int onceGetNum = 20;
      final relist = <BiliVideoInfoEntity_c>[];
      // 计算需要发送请求的次数
      final int runNum = (info.count + onceGetNum - 1) ~/ onceGetNum;
      for (int i = 0; i < runNum; ++i) {
        await Future.delayed(const Duration(milliseconds: 300));
        // 分页获取收藏夹内所有的视频
        final resp = await MyNet_c.to().bili_get(
          MyUrl_e.bili_getStarFolderVideoList,
          queryParameters: {
            "media_id": info.id,
            "pn": i + 1,
            "ps": onceGetNum,
            "order": "mtime",
            "type": 0,
            "tid": 0,
            "platform": "web",
            "jsonp": "jsonp",
          },
          doErrTip: doErrTip,
        );
        if (null != resp &&
            200 == resp.statusCode &&
            null != resp.data["data"]) {
          final List vlist = resp.data["data"]["medias"];
          // 将单次请求的视频列表解析出来
          for (int i = 0, len = vlist.length; i < len; ++i) {
            final item = vlist[i];
            final video = BiliVideoInfoEntity_c(
              attr: item["attr"] ?? 0,
              bvid: item["bvid"] ?? "",
              duration: (item["duration"] ?? 0) * 1000,
              title: item["title"] ?? "",
              own: item["upper"]?["name"] ?? "",
              icon: MySrcImage_c(
                info: MySrcInfo_c(
                  type: MySrcType_e.Bili,
                ),
                src: item["cover"] ?? "",
              ),
            );
            video.pages.add(BiliVideoInfoPagesItem_c(
              title: video.title,
              duration: video.duration,
              page: item["page"],
              icon: video.icon,
            ));
            relist.add(video);
          }
        } else if (doErrTip) {
          MyPopup.showSWinToast("拉取失败");
        }
      }
      return relist;
    }
    return null;
  }

  /// 获取up的视频数量
  Future<int?> getBiliUpVideoNum(
    int mid, {
    bool doErrTip = true,
  }) async {
    final resp = await MyNet_c.to().bili_get(
      MyUrl_e.bili_getUpVideoNum,
      queryParameters: {
        "mid": mid,
      },
      doErrTip: doErrTip,
    );
    if (resp?.statusCode == 200 && null != resp!.data?["data"]) {
      if (resp.data["data"]["video"] is int) {
        return resp.data["data"]["video"];
      }
    }
    return null;
  }

  /// 获取bili的up的 视频列表/合集 列表信息
  Future<List<BiliUpFolderEntity_c>?> getBiliUpFolderlist(
    int mid, {
    int? page_num,
    int? page_size,
    bool doErrTip = true,
  }) async {
    assert((null == page_num && null == page_size) ||
        (null != page_num && null != page_size));
    if (mid >= 0) {
      // 获取列表所有内容，然后返回
      if (null == page_num) {
        int? total;
        // 获取视频数量
        final relist = <BiliUpFolderEntity_c>[];
        for (int i = 0;; ++i) {
          await Future.delayed(const Duration(milliseconds: 300));
          final resp = await MyNet_c.to().bili_get(
            MyUrl_e.bili_getUpVideoFolderlist,
            queryParameters: {
              "mid": mid,
              "page_num": i + 1,
              "page_size": 20,
            },
            headerType: MyBiliHeaders_e.Space,
            doErrTip: doErrTip,
          );
          if (resp?.statusCode == 200 && null != resp!.data["data"]) {
            total ??= resp.data["data"]["items_lists"]?["page"]?["total"];
            if (null == total || total <= 0) {
              break;
            }
            // 列表
            final series = resp.data["data"]["items_lists"]["series_list"];
            if (series is List) {
              for (int i = 0; i < series.length; ++i) {
                final item = series[i]["meta"];
                if (item is Map) {
                  relist.add(
                    BiliUpFolderEntity_c(
                      type: BiliUpFolderType_e.Series,
                      icon: MySrcImage_c(
                        info: MySrcInfo_c(type: MySrcType_e.Bili),
                        src: item["cover"] ?? "",
                      ),
                      title: item["name"] ?? "",
                      id: item["series_id"] ?? -1,
                      mid: item["mid"] ?? -1,
                      total: item["total"] ?? 0,
                    ),
                  );
                }
              }
            }
            // 合集
            final seasons = resp.data["data"]["items_lists"]["seasons_list"];
            if (seasons is List) {
              for (int i = 0; i < seasons.length; ++i) {
                final item = seasons[i]["meta"];
                if (item is Map) {
                  relist.add(
                    BiliUpFolderEntity_c(
                      type: BiliUpFolderType_e.Season,
                      icon: MySrcImage_c(
                        info: MySrcInfo_c(type: MySrcType_e.Bili),
                        src: item["cover"] ?? "",
                      ),
                      title: item["name"] ?? "",
                      id: item["season_id"] ?? -1,
                      mid: item["mid"] ?? -1,
                      total: item["total"] ?? 0,
                    ),
                  );
                }
              }
            }
          } else {
            break;
          }
          if (relist.length >= total) {
            break;
          }
        }
        return relist;
      } else {
        final resp = await MyNet_c.to().bili_get(
          MyUrl_e.bili_getUpVideoFolderlist,
          queryParameters: {
            "mid": mid,
            "page_num": page_num,
            "page_size": page_size,
          },
          doErrTip: doErrTip,
        );
        if (null != resp?.data && 200 == resp!.statusCode) {
          final folders = resp.data["data"]?["items_lists"]?["series_list"];
          if (folders is List) {
            final relist = <BiliUpFolderEntity_c>[];
            // 列表
            final series = resp.data["data"]["items_lists"]["series_list"];
            if (series is List) {
              for (int i = 0; i < series.length; ++i) {
                final item = series[i]["meta"];
                if (item is Map) {
                  relist.add(
                    BiliUpFolderEntity_c(
                      type: BiliUpFolderType_e.Series,
                      icon: MySrcImage_c(
                        info: MySrcInfo_c(type: MySrcType_e.Bili),
                        src: item["cover"] ?? "",
                      ),
                      title: item["name"] ?? "",
                      id: item["series_id"] ?? -1,
                      mid: item["mid"] ?? -1,
                      total: item["total"] ?? 0,
                    ),
                  );
                }
              }
            }
            // 合集
            final seasons = resp.data["data"]["items_lists"]["seasons_list"];
            if (seasons is List) {
              for (int i = 0; i < seasons.length; ++i) {
                final item = seasons[i]["meta"];
                if (item is Map) {
                  relist.add(
                    BiliUpFolderEntity_c(
                      type: BiliUpFolderType_e.Season,
                      icon: MySrcImage_c(
                        info: MySrcInfo_c(type: MySrcType_e.Bili),
                        src: item["cover"] ?? "",
                      ),
                      title: item["name"] ?? "",
                      id: item["season_id"] ?? -1,
                      mid: item["mid"] ?? -1,
                      total: item["total"] ?? 0,
                    ),
                  );
                }
              }
            }
            return relist;
          }
        }
      }
    }
    return null;
  }

  /// 获取对应up的指定[series_id] 的 列表 内容
  Future<List<BiliVideoInfoEntity_c>?> getBiliUpFolderSeriesVodeoContent(
    BiliUpInfoEntity_c upinfo,
    int series_id, {
    int? page_num,
    int? page_size,
    bool doErrTip = true,
  }) async {
    assert((null == page_num && null == page_size) ||
        (null != page_num && null != page_size));
    if (series_id >= 0 && upinfo.mid >= 0) {
      if (null == page_num) {
        int? total;
        final relist = <BiliVideoInfoEntity_c>[];
        for (int i = 0;; ++i) {
          await Future.delayed(const Duration(milliseconds: 500));
          final query = await MyBiliPlugin_c.to().encodeWbiQuery({
            "mid": upinfo.mid,
            "series_id": series_id,
            "pn": i + 1,
            "ps": 30,
            "only_normal": true,
            "sort": "desc",
          });
          if (null == query) {
            break;
          }
          final resp = await MyNet_c.to().bili_get(
            "${MyUrl_e.bili_getVideoFolderSeriesContent}?$query",
            headerType: MyBiliHeaders_e.Space,
            doErrTip: doErrTip,
          );
          if (null != resp?.data && 200 == resp!.statusCode) {
            total ??= resp.data["data"]?["page"]?["total"];
            if (null == total) {
              break;
            }
            final in_list = resp.data["data"]["archives"];
            if (in_list is List) {
              for (int i = 0; i < in_list.length; ++i) {
                final item = in_list[i];
                final initem = BiliVideoInfoEntity_c(
                  attr: item["state"] ?? 0,
                  avid: item["aid"] ?? -1,
                  bvid: item["bvid"] ?? "",
                  title: item["title"] ?? "",
                  created_time: item["ctime"] ?? 0,
                  own: upinfo.name,
                  icon: MySrcImage_c(
                    info: MySrcInfo_c(type: MySrcType_e.Bili),
                    src: item["pic"] ?? "",
                  ),
                  duration: (item["duration"] ?? 0) * 1000,
                );
                initem.pages = [
                  BiliVideoInfoPagesItem_c(
                    icon: initem.icon,
                    title: initem.title,
                  )
                ];
                relist.add(initem);
              }
            }
          } else {
            break;
          }
          if (relist.length >= total) {
            break;
          }
        }
        if (null != total) {
          return relist;
        }
      } else {
        final query = await MyBiliPlugin_c.to().encodeWbiQuery({
          "mid": upinfo.mid,
          "series_id": series_id,
          "pn": page_num,
          "ps": page_size,
          "only_normal": true,
          "sort": "desc",
        });
        if (null == query) {
          return null;
        }
        final resp = await MyNet_c.to().bili_get(
          "${MyUrl_e.bili_getVideoFolderSeriesContent}?$query",
          doErrTip: doErrTip,
        );
        if (null != resp?.data && 200 == resp!.statusCode) {
          final in_list = resp.data["data"]?["archives"];
          if (in_list is List) {
            final relist = <BiliVideoInfoEntity_c>[];
            for (int i = 0; i < in_list.length; ++i) {
              final item = in_list[i];
              final initem = BiliVideoInfoEntity_c(
                attr: item["state"] ?? 0,
                avid: item["aid"] ?? -1,
                bvid: item["bvid"] ?? "",
                title: item["title"] ?? "",
                created_time: item["ctime"] ?? 0,
                own: upinfo.name,
                icon: MySrcImage_c(
                  info: MySrcInfo_c(type: MySrcType_e.Bili),
                  src: item["pic"] ?? "",
                ),
                duration: (item["duration"] ?? 0) * 1000,
              );
              initem.pages = [
                BiliVideoInfoPagesItem_c(
                  icon: initem.icon,
                  title: initem.title,
                )
              ];
              relist.add(initem);
            }
            return relist;
          }
        }
      }
    }
    return null;
  }

  /// 获取对应up的指定 [season_id] 的 合集 内容
  Future<List<BiliVideoInfoEntity_c>?> getBiliUpFolderSeasonVideoContent(
    BiliUpInfoEntity_c upinfo,
    int season_id, {
    int? page_num,
    int? page_size,
    bool doErrTip = true,
  }) async {
    assert((null == page_num && null == page_size) ||
        (null != page_num && null != page_size));
    if (season_id >= 0 && upinfo.mid >= 0) {
      if (null == page_num) {
        int? total;
        final relist = <BiliVideoInfoEntity_c>[];
        for (int i = 0;; ++i) {
          await Future.delayed(const Duration(milliseconds: 500));
          final query = await MyBiliPlugin_c.to().encodeWbiQuery({
            "mid": upinfo.mid,
            "season_id": season_id,
            "page_num": i + 1,
            "page_size": 30,
            "sort_reverse": false,
          });
          if (null == query) {
            return null;
          }
          final resp = await MyNet_c.to().bili_get(
            "${MyUrl_e.bili_getVideoFolderSeasonContent}?$query",
            headerType: MyBiliHeaders_e.Space,
            doErrTip: doErrTip,
          );
          if (null != resp?.data && 200 == resp!.statusCode) {
            total ??= resp.data["data"]?["page"]?["total"];
            if (null == total) {
              break;
            }
            final in_list = resp.data["data"]["archives"];
            if (in_list is List) {
              for (int i = 0; i < in_list.length; ++i) {
                final item = in_list[i];
                final initem = BiliVideoInfoEntity_c(
                  attr: item["state"] ?? 0,
                  avid: item["aid"] ?? -1,
                  bvid: item["bvid"] ?? "",
                  title: item["title"] ?? "",
                  created_time: item["ctime"] ?? 0,
                  own: upinfo.name,
                  icon: MySrcImage_c(
                    info: MySrcInfo_c(type: MySrcType_e.Bili),
                    src: item["pic"] ?? "",
                  ),
                  duration: (item["duration"] ?? 0) * 1000,
                );
                initem.pages = [
                  BiliVideoInfoPagesItem_c(
                    icon: initem.icon,
                    title: initem.title,
                  )
                ];
                relist.add(initem);
              }
            }
          } else {
            break;
          }
          if (relist.length >= total) {
            break;
          }
        }
        if (null != total) {
          return relist;
        }
      } else {
        final query = await MyBiliPlugin_c.to().encodeWbiQuery({
          "mid": upinfo.mid,
          "season_id": season_id,
          "page_num": page_num,
          "page_size": page_size,
          "sort_reverse": false,
        });
        if (null == query) {
          return null;
        }
        final resp = await MyNet_c.to().bili_get(
          "${MyUrl_e.bili_getVideoFolderSeasonContent}?$query",
          doErrTip: doErrTip,
        );
        if (null != resp?.data && 200 == resp!.statusCode) {
          final in_list = resp.data["data"]?["archives"];
          if (in_list is List) {
            final relist = <BiliVideoInfoEntity_c>[];
            for (int i = 0; i < in_list.length; ++i) {
              final item = in_list[i];
              final initem = BiliVideoInfoEntity_c(
                attr: item["state"] ?? 0,
                avid: item["aid"] ?? -1,
                bvid: item["bvid"] ?? "",
                title: item["title"] ?? "",
                created_time: item["ctime"] ?? 0,
                own: upinfo.name,
                icon: MySrcImage_c(
                  info: MySrcInfo_c(type: MySrcType_e.Bili),
                  src: item["pic"] ?? "",
                ),
                duration: (item["duration"] ?? 0) * 1000,
              );
              initem.pages = [
                BiliVideoInfoPagesItem_c(
                  icon: initem.icon,
                  title: initem.title,
                )
              ];
              relist.add(initem);
            }
            return relist;
          }
        }
      }
    }
    return null;
  }

  /// 获取bili用户信息
  Future<BiliUpInfoEntity_c?> getBiliUpInfo(
    int mid, {
    bool doErrTip = true,
  }) async {
    if (mid < 0) {
      return null;
    }
    final query = await MyBiliPlugin_c.to().encodeWbiQuery({
      "mid": mid,
    });
    final resp = await MyNet_c.to().bili_get(
      "${MyUrl_e.bili_getUpInfo}?$query",
      headerType: MyBiliHeaders_e.Space,
      doErrTip: doErrTip,
    );
    if (200 == resp?.statusCode && null != resp!.data) {
      final json = resp.data["data"];
      if (null != json) {
        return BiliUpInfoEntity_c(
          mid: json["mid"] ?? mid,
          icon: MySrcImage_c(
            info: MySrcInfo_c(type: MySrcType_e.Bili),
            src: json["face"] ?? "",
          ),
          name: json["name"] ?? "",
        );
      }
    }
    return null;
  }

  /// 获取bili用户创建的视频列表
  Future<List<BiliVideoInfoEntity_c>?> getBiliUpCreatedVideos(
    int mid, {
    int? page_num,
    int? page_size,
    int limitReqNum = 10,
    bool doErrTip = true,
  }) async {
    assert((null == page_num && null == page_size) ||
        (null != page_num && null != page_size));
    if (mid >= 0) {
      if (null == page_num) {
        int? total;
        final relist = <BiliVideoInfoEntity_c>[];
        for (int i = 0; limitReqNum-- > 0; ++i) {
          await Future.delayed(const Duration(milliseconds: 300));
          // 参数签名
          final query = await encodeWbiQuery({
            "mid": mid,
            "ps": 30,
            "pn": i + 1,
            "order": "pubdate",
            "platform": "web",
          });
          if (null == query) {
            break;
          }
          final resp = await MyNet_c.to().bili_get(
            "${MyUrl_e.bili_getUpCreatedVideos}?$query",
            doErrTip: doErrTip,
          );
          if (200 == resp?.statusCode && null != resp!.data) {
            total ??= resp.data["data"]?["page"]?["count"];
            if (null == total) {
              break;
            }
            final in_list = resp.data["data"]["list"]?["vlist"];
            if (in_list is List && in_list.isNotEmpty) {
              for (int i = 0; i < in_list.length; ++i) {
                final item = in_list[i];
                final initem = BiliVideoInfoEntity_c(
                  attr: item["attribute"] ?? 0,
                  avid: item["aid"] ?? -1,
                  bvid: item["bvid"] ?? "",
                  own: item["author"] ?? "",
                  icon: MySrcImage_c(
                    info: MySrcInfo_c(type: MySrcType_e.Bili),
                    src: item["pic"] ?? "",
                  ),
                  title: item["title"] ?? "",
                  created_time: item["created"] ?? 0,
                );
                initem.pages = [
                  BiliVideoInfoPagesItem_c(
                    title: initem.title,
                    icon: initem.icon,
                  ),
                ];
                relist.add(initem);
              }
            }
          } else {
            break;
          }
          if (relist.length >= total) {
            break;
          }
        }
        if (null != total) {
          return relist;
        }
      } else {
        final query = await encodeWbiQuery({
          "mid": mid,
          "tid": 0,
          "pn": page_num,
          "ps": page_size,
          "order": "pubdate",
          "order_avoided": true,
        });
        if (null == query) {
          return null;
        }
        final resp = await MyNet_c.to().bili_get(
          "${MyUrl_e.bili_getUpCreatedVideos}?$query",
          headerType: MyBiliHeaders_e.Space,
          doErrTip: doErrTip,
        );
        if (200 == resp?.statusCode && null != resp!.data) {
          final in_list = resp.data["data"]["list"]?["vlist"];
          if (in_list is List && in_list.isNotEmpty) {
            final relist = <BiliVideoInfoEntity_c>[];
            for (int i = 0; i < in_list.length; ++i) {
              final item = in_list[i];
              final initem = BiliVideoInfoEntity_c(
                attr: item["attribute"] ?? 0,
                avid: item["aid"] ?? -1,
                bvid: item["bvid"] ?? "",
                own: item["author"] ?? "",
                icon: MySrcImage_c(
                  info: MySrcInfo_c(type: MySrcType_e.Bili),
                  src: item["pic"] ?? "",
                ),
                title: item["title"] ?? "",
                created_time: item["created"] ?? 0,
              );
              initem.pages = [
                BiliVideoInfoPagesItem_c(
                  title: initem.title,
                  icon: initem.icon,
                )
              ];
              relist.add(initem);
            }
            return relist;
          }
        }
      }
    }
    return null;
  }

  /// 搜索Bili视频
  /// * 返回视频资源列表
  /// * 列表中的元素不包含[pages]，由于搜索结果包含整个bv，
  /// 即可能包含多p，需要进一步获取其pages
  Future<List<BiliVideoInfoEntity_c>?> searchType(
    String str,
    String type, {
    bool doErrTip = true,
    int? page,
  }) async {
    final rebool = await cookies.flushCookies(doErrTip: doErrTip);
    if (false == rebool) {
      return null;
    }
    final query = await encodeWbiQuery({
      "keyword": str,
      "search_type": type,
      "page": page ?? 1,
    });
    final resp = await MyNet_c.to().bili_get(
      "${MyUrl_e.bili_searchType}?$query",
      header: {
        "Cookie": cookies.getString(),
      },
      doErrTip: doErrTip,
    );
    if (200 == resp?.statusCode && 0 == resp?.data["code"]) {
      final List? datalist = resp?.data["data"]?["result"];
      if (null != datalist) {
        final relist = <BiliVideoInfoEntity_c>[];
        for (int i = 0; i < datalist.length; ++i) {
          final item = datalist[i];
          final icon = MySrcImage_c(
            info: MySrcInfo_c(type: MySrcType_e.Bili),
            src: item["pic"] ?? "",
          );
          if (icon.src.startsWith('//')) {
            icon.setSrc('https:${icon.src}');
          }
          String title = item["title"] ?? "";
          title = title
              .replaceAll('<em class="keyword">', '')
              .replaceAll('</em>', '');
          relist.add(BiliVideoInfoEntity_c(
            avid: item["aid"] ?? -1,
            bvid: item["bvid"] ?? "",
            own: item["author"] ?? "",
            icon: icon,
            title: title,
            playNum: item["play"] ?? 0,
            duration:
                MyParse_c.parseDurationStr2Seconds(item["duration"] ?? "") *
                    1000,
            created_time: (item["pubdate"] ?? item["senddate"] ?? 0) * 1000,
          ));
        }
        return relist;
      }
    }
    return null;
  }
}

class BiliSearchType_e {
  static const String type_video = "video",
      type_media_bangumi = "media_bangumi",
      type_media_ft = "media_ft",
      type_live = "live",
      type_live_room = "live_room",
      type_live_user = "live_user",
      type_article = "article",
      type_topic = "topic",
      type_bili_user = "bili_user",
      type_photo = "photo";
}

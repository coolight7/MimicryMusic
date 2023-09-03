// ignore_for_file: file_names, camel_case_types, constant_identifier_names, non_constant_identifier_names

import 'dart:convert' as convert;
import 'package:mymusic/components/global/MyImage.dart';
import 'package:mymusic/store/PlaylistStore.dart';
import 'package:mymusic/util/MyLogger.dart';
import 'package:mymusic/util/MySrc.dart';

/// bili资源的srcInfo 中addInfos对应位置存储内容
class BiliSrcAddInfoIndex_e {
  // 分p时的下标
  static const AudioPIndex = 0;
}

class BiliVideoInfoPagesItem_c {
  int duration; // 单位：ms
  MySrcImage_c icon;
  String title;
  int page;

  BiliVideoInfoPagesItem_c({
    this.duration = 0,
    required this.icon,
    this.title = "",
    this.page = 1,
  });

  factory BiliVideoInfoPagesItem_c.fromJson(Map<String, dynamic> json) {
    return BiliVideoInfoPagesItem_c(
      duration: (json["duration"] ?? 0) * 1000,
      icon: MySrcImage_c(
        info: MySrcInfo_c(
          type: (null != json["first_frame"])
              ? MySrcType_e.Bili
              : MySrcType_e.Undefined,
        ),
        src: json["first_frame"] ?? "",
      ),
      title: json["part"] ?? "",
      page: json["page"] ?? 0,
    );
  }
}

/// bili视频资源信息
class BiliVideoInfoEntity_c {
  int attr;
  int avid;
  String bvid;
  String title;
  String own;
  MySrcImage_c icon;
  int playNum = 0;
  int duration; // 单位：ms
  List<BiliVideoInfoPagesItem_c> pages = [];
  BiliUpFolderEntity_c? season;
  int created_time;

  BiliVideoInfoEntity_c({
    this.attr = 0,
    this.avid = -1,
    this.bvid = "",
    this.title = "",
    this.own = "",
    required this.icon,
    this.playNum = 0,
    this.duration = 0,
    this.created_time = 0,
    this.season,
  });

  factory BiliVideoInfoEntity_c.fromJson(Map<String, dynamic> json) {
    final entity = BiliVideoInfoEntity_c(
      avid: json["avid"] ?? -1,
      bvid: json["bvid"] ?? "",
      title: json["title"] ?? "",
      own: json["owner"]["name"] ?? "",
      icon: MySrcImage_c(
        info: MySrcInfo_c(
          type:
              (null != json["pic"]) ? MySrcType_e.Bili : MySrcType_e.Undefined,
        ),
        src: json["pic"] ?? "",
      ),
      playNum: json["play"] ?? 0,
      duration: (json["duration"] ?? 0) * 1000,
      created_time: json["pubdate"] ?? 0,
    );
    final pages = json["pages"];
    if (pages is List) {
      for (int i = 0; i < pages.length; ++i) {
        entity.pages.add(BiliVideoInfoPagesItem_c.fromJson(pages[i]));
      }
    }
    final season = json["ugc_season"];
    if (season is Map) {
      entity.season = BiliUpFolderEntity_c(
        id: season["id"],
        type: BiliUpFolderType_e.Season,
        icon: MySrcImage_c(
          info: MySrcInfo_c(type: MySrcType_e.Bili),
          src: season["cover"] ?? "",
        ),
        title: season["title"] ?? "",
        depict: season["intro"] ?? "",
        mid: season["mid"] ?? -1,
        total: season["ep_count"] ?? 0,
      );
      if (season["sections"] is List) {
        final List list = season["sections"];
        for (int i = 0; i < list.length; ++i) {
          final seasonItem = list[i];
          if (seasonItem["episodes"] is List) {
            final List episodes = seasonItem["episodes"];
            for (int j = 0; j < episodes.length; ++j) {
              final item = episodes[j];
              if (item["arc"] is Map) {
                final arc = item["arc"];
                final seasonItem = BiliVideoInfoEntity_c(
                  attr: arc["state"] ?? 0,
                  avid: item["aid"] ?? -1,
                  bvid: item["bvid"] ?? "",
                  title: item["title"] ?? "",
                  own: entity.own,
                  icon: (null != arc["pic"])
                      ? MySrcImage_c(
                          info: MySrcInfo_c(
                            type: MySrcType_e.Bili,
                          ),
                          src: arc["pic"],
                        )
                      : entity.icon,
                  playNum: json["play"] ?? 0,
                  duration: (arc["duration"] ?? 0) * 1000,
                  created_time: arc["ctime"] ?? 0,
                );
                if (item["page"] is Map) {
                  final page = item["page"];
                  seasonItem.pages.add(BiliVideoInfoPagesItem_c(
                    title: page["part"] ?? "",
                    icon: MySrcImage_c(),
                    duration: page["duration"] ?? 0,
                    page: page["page"] ?? 1,
                  ));
                }
                entity.season!.list.add(seasonItem);
              }
            }
          }
        }
      }
    }
    return entity;
  }

  factory BiliVideoInfoEntity_c.fromJsonStr(String json) {
    try {
      return BiliVideoInfoEntity_c.fromJson(convert.jsonDecode(json));
    } catch (e) {
      PlaylistStore.mylog.severe(MyLogItem(
        prefix: "json 解析错误",
        msg: [e.toString(), json],
      ));
      return BiliVideoInfoEntity_c(icon: MySrcImage_c());
    }
  }
}

/// bili收藏夹结构
class BiliStarFolderEntity_c {
  int id;
  int fid;

  /// 包含的视频数量
  int count;

  String title;

  /// 描述
  String depict;

  BiliStarFolderEntity_c({
    this.id = -1,
    this.fid = -1,
    this.count = 0,
    this.title = "",
    this.depict = "",
  });
}

enum BiliUpFolderType_e {
  Series, // 列表
  Season, // 合集
}

/// bili的up创建合集结构
class BiliUpFolderEntity_c {
  /// id
  int id;

  BiliUpFolderType_e type;

  int mid;

  /// 包含的数量
  int total;

  String title;

  String depict;

  MySrcImage_c icon;

  List<BiliVideoInfoEntity_c> list = [];

  BiliUpFolderEntity_c({
    this.id = -1,
    required this.type,
    this.mid = -1,
    this.total = 0,
    this.title = "",
    this.depict = "",
    required this.icon,
  });
}

class BiliUpInfoEntity_c {
  int mid;
  String name;
  MySrcImage_c icon;
  int videoNum;

  BiliUpInfoEntity_c({
    this.mid = -1,
    this.name = "",
    required this.icon,
    this.videoNum = 0,
  });
}

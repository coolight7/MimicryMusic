import { myMapStringify } from "./GlobalUtil";

export enum MySrcType_e {
  Bili,
  UrlLink,
  MyCos,
  MyLink,
  MyId,
  Local,
  LocalCache,
  Asset,
  Undefined,
}

export class MySrcTypeStr_e {
  static BiliStr = "bili";
  static UrlLinkStr = "link";
  static LocalStr = "local";
  static AssetStr = "assest";
  static LocalCacheStr = "localCache";
  static MyId = "myid";
  static MyLink = "mylink";
  static MyCos = "mycos";
  static UndefinedStr = "";
  static typeStrMap = new Map<string, MySrcType_e>([
    [MySrcTypeStr_e.UndefinedStr, MySrcType_e.Undefined],
    [MySrcTypeStr_e.BiliStr, MySrcType_e.Bili],
    [MySrcTypeStr_e.UrlLinkStr, MySrcType_e.UrlLink],
    [MySrcTypeStr_e.LocalStr, MySrcType_e.Local],
    [MySrcTypeStr_e.LocalCacheStr, MySrcType_e.LocalCache],
    [MySrcTypeStr_e.AssetStr, MySrcType_e.Asset],
    [MySrcTypeStr_e.MyId, MySrcType_e.MyId],
    [MySrcTypeStr_e.MyLink, MySrcType_e.MyLink],
    [MySrcTypeStr_e.MyCos, MySrcType_e.MyCos],
  ]);
  static toTypeStr(type: MySrcType_e): string {
    switch (type) {
      case MySrcType_e.Undefined:
        return MySrcTypeStr_e.UndefinedStr;
      case MySrcType_e.Bili:
        return MySrcTypeStr_e.BiliStr;
      case MySrcType_e.UrlLink:
        return MySrcTypeStr_e.UrlLinkStr;
      case MySrcType_e.Local:
        return MySrcTypeStr_e.LocalStr;
      case MySrcType_e.LocalCache:
        return MySrcTypeStr_e.LocalCacheStr;
      case MySrcType_e.Asset:
        return MySrcTypeStr_e.AssetStr;
      case MySrcType_e.MyLink:
        return MySrcTypeStr_e.MyLink;
      case MySrcType_e.MyId:
        return MySrcTypeStr_e.MyId;
      case MySrcType_e.MyCos:
        return MySrcTypeStr_e.MyCos;
    }
  }

  static toTag(type: MySrcType_e): string | null {
    switch (type) {
      case MySrcType_e.Bili:
        return "bili";
      case MySrcType_e.MyCos:
      case MySrcType_e.MyLink:
      case MySrcType_e.UrlLink:
        return "链接";
      case MySrcType_e.Asset:
      case MySrcType_e.Local:
      case MySrcType_e.LocalCache:
        return "本地";
      case MySrcType_e.Undefined:
      case MySrcType_e.MyId:
      case null:
        return null;
    }
  }

  static toType(in_type: string | null): MySrcType_e | null {
    if (null == in_type) {
      return null;
    }
    return MySrcTypeStr_e.typeStrMap.get(in_type) ?? null;
  }

  // 当in_type不合规时，使用undefined返回
  static mustToType(in_type: string | null): MySrcType_e {
    if (null == in_type) {
      return MySrcType_e.Undefined;
    }
    return MySrcTypeStr_e.typeStrMap.get(in_type) ?? MySrcType_e.Undefined;
  }
}

export class MySrcInfo_c {
  // 资源类型
  _type: MySrcType_e = MySrcType_e.Undefined;

  get type(): MySrcType_e {
    return this._type;
  }
  // 获取type的字符串格式
  get typeStr(): string {
    return MySrcTypeStr_e.toTypeStr(this.type);
  }

  constructor(
    type: MySrcType_e = MySrcType_e.Undefined,
  ) {
    this._type = type;
  }

  static fromJson(json: Map<string, any>): MySrcInfo_c {
    const reObj = new MySrcInfo_c();
    const rebool = reObj.oFromJson(json);
    if (true == rebool) {
      return reObj;
    } else {
      return new MySrcInfo_c();
    }
  }

  static fromJsonStr(json: string): MySrcInfo_c {
    const reObj = new MySrcInfo_c();
    const rebool = reObj.oFromJsonStr(json);
    if (true == rebool) {
      return reObj;
    } else {
      return new MySrcInfo_c();
    }
  }

  setType(in_type: MySrcType_e): void {
    this._type = in_type;
  }

  oFromJson(json: Map<string, any>): boolean {
    const retype = MySrcTypeStr_e.toType(json['type']);
    if (null != retype) {
      this._type = retype;
      return true;
    } else {
      return false;
    }
  }

  oFromJsonStr(json: string): boolean {
    return this.oFromJson(JSON.parse(json));
  }

  copyWith(
    type:MySrcType_e | null = null,
  ):MySrcInfo_c {
    return new MySrcInfo_c(
      type ?? this.type,
    );
  }

  toJson(): Map<string, any> {
    if (MySrcType_e.Undefined == this.type) {
      return new Map<string, any>();
    } else {
      return new Map<string, any>(
        [['type', this.typeStr]]
      );
    }
  }

  toString():string {
    const remap = this.toJson();
    if(remap.size > 0) {
      return myMapStringify(remap);
    } else {
      return "";
    }
  }
}

export class MySrc_c<T extends MySrcInfo_c> {
  /// 截取string中的json信息部分
  static reg = RegExp('^(\{.+?\})');

  /// 主体变量 -------------
  /// 资源路径
  _src: string = "";

  /// 资源信息
  _info: T | any = new MySrcInfo_c();

  /// 辅助变量 --------------

  /// 用于辅助toString缓存判断的哈希值
  _toStringHashCode: number = -1;

  /// toString 方法的缓存
  _toStringCache: string | null = null;

  /// get ---------------
  get src(): string {
    return this._src;
  }

  get info(): T {
    return this._info;
  }

  constructor(
    info: T,
    src: string = "",
  ) {
    this._info = info;
    this._src = src;
  }

  setSrc(in_src: string): void {
    this._src = in_src;
  }

  setInfo(in_info: T): void {
    this._info = in_info;
  }

  static fromString<T extends MySrcInfo_c>(in_str: string, info: T): MySrc_c<T> {
    const src = new MySrc_c<T>(
      info,
    );
    src.oFromString(in_str);
    return src;
  }

  oFromString(in_str: string): void {
    if (in_str.length > 0) {
      // in_str非空
      // 截取json信息
      const result = in_str.match(MySrc_c.reg);
      if (null != result) {
        const jsonInfoStr = result[1];
        if (null != jsonInfoStr) {
          const rebool = this._info.oFromJsonStr(jsonInfoStr);
          if (true == rebool) {
            // 解析json信息成功，则把后面部分作为src
            this.setSrc(in_str.substring(jsonInfoStr.length));
            return;
            // 否则整个str都是src
          }
        }
      }
    }
    this.setSrc(in_str);
  }

  /// 检查资源是否为空
  isSrcEmpty(): boolean {
    return (this.src.length > 0);
  }

  copyWith(
    src:string | null = null,
    info:T | null = null,
  ):MySrc_c<T> {
    return new MySrc_c<T>(
      info ?? this._info.copyWith(),
      src ?? this.src,
    );
  }

  toString(): string {
    // {info}src
    const remap = this.info.toJson();
    if (remap.size == 0) {
      return this.src;
    }

    let infoStr = myMapStringify(remap);
    return infoStr + this.src;
  }
}


export class MyLogItem {
    prefix: string | null = null;
    msg: Array<any> | null = null;

    constructor(
        prefix: string | null = null,
        msg: Array<any> | null = null
    ) {
        this.prefix = prefix;
        this.msg = msg;
    }
}

export class MyLogger {
    static info(item: MyLogItem): void {
        console.log(item);
    }

    static severe(item: MyLogItem): void {
        console.error(item);
    }

    static warn(item: MyLogItem): void {
        console.warn(item);
    }
}

export function myMapStringify(map: Map<string, any>): string {
    let reStr = "";
    map.forEach((value, key, map) => {
        if (reStr.length > 0) {
            reStr += ",";
        }
        reStr += "\"" + key + "\":";
        if (value instanceof Map) {
            reStr += myMapStringify(value);
        } else {
            reStr += JSON.stringify(value);
        }
    });
    return "{" + reStr + "}";
}

export function myArrayStringify(list:Array<any>, itemStrify:(item:any, index:number) => string):string {
    let reStr = "";
    list.forEach((value, index, list)=> {
        if(reStr.length > 0) {
            reStr += ",";
        }
        reStr += itemStrify(value, index);
    });
    return "[" + reStr + "]";
}
// UUIDv4の形式かどうかを判定
export default function CheckUUID(text:string):boolean{
    const uuidPattern = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$");
    return uuidPattern.test(text);
}
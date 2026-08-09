import { parse } from 'secure-json-parse';

export function safeJsonParse<T>(json: string): T {
  return parse(json, undefined, {
    protoAction: 'remove',
    constructorAction: 'remove',
  }) as T;
}

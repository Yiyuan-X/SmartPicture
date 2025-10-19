type GenericErrorObject = {
  [key: string]: unknown;
};

function readNumberProperty(source: GenericErrorObject, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") {
      return value;
    }
  }
  return undefined;
}

function readNestedNumber(source: GenericErrorObject, keyPath: string[]): number | undefined {
  let current: unknown = source;
  for (const key of keyPath) {
    if (typeof current !== "object" || current === null || !(key in (current as GenericErrorObject))) {
      return undefined;
    }
    current = (current as GenericErrorObject)[key];
  }
  return typeof current === "number" ? current : undefined;
}

/**
 * Extracts a numeric status code (e.g. HTTP status or gRPC code) from Google API errors.
 */
export function getGoogleErrorStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const plainError = error as GenericErrorObject;

  const direct = readNumberProperty(plainError, ["status", "code"]);
  if (typeof direct === "number") {
    return direct;
  }

  const nestedPaths = [
    ["error", "status"],
    ["error", "code"],
    ["response", "status"],
    ["response", "code"],
  ];

  for (const path of nestedPaths) {
    const nested = readNestedNumber(plainError, path);
    if (typeof nested === "number") {
      return nested;
    }
  }

  return undefined;
}

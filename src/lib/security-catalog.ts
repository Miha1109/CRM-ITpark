export type SecurityCategory = "Антивирус" | "СЗИ" | "Управление";
export type SecurityProduct = {
  id: string;
  name: string;
  vendor: string;
  category: SecurityCategory;
  signatures: string[];
};

// Literal software-name / executable signatures, not malware signatures or certification claims.
export const SECURITY_CATALOG: SecurityProduct[] = [
  {
    id: "kes",
    name: "Kaspersky Endpoint Security",
    vendor: "Лаборатория Касперского",
    category: "Антивирус",
    signatures: ["Kaspersky Endpoint Security", "Касперский Endpoint Security", "kes.exe"],
  },
  {
    id: "kav",
    name: "Kaspersky Anti-Virus",
    vendor: "Лаборатория Касперского",
    category: "Антивирус",
    signatures: ["Kaspersky Anti-Virus", "Kaspersky Antivirus", "Антивирус Касперского"],
  },
  {
    id: "kis",
    name: "Kaspersky Internet Security",
    vendor: "Лаборатория Касперского",
    category: "Антивирус",
    signatures: ["Kaspersky Internet Security"],
  },
  {
    id: "ksc",
    name: "Kaspersky Security Center",
    vendor: "Лаборатория Касперского",
    category: "Управление",
    signatures: [
      "Kaspersky Security Center",
      "Kaspersky Network Agent",
      "Агент администрирования Kaspersky",
      "klnagent.exe",
    ],
  },
  {
    id: "drweb",
    name: "Dr.Web Security Space",
    vendor: "Доктор Веб",
    category: "Антивирус",
    signatures: ["Dr.Web Security Space", "Dr Web Security Space"],
  },
  {
    id: "drweb-es",
    name: "Dr.Web Enterprise Security Suite",
    vendor: "Доктор Веб",
    category: "Антивирус",
    signatures: [
      "Dr.Web Enterprise Security",
      "Dr.Web Agent",
      "Dr.Web for Windows",
      "Антивирус Dr.Web",
      "dwengine.exe",
    ],
  },
  {
    id: "eset-av",
    name: "ESET Endpoint Antivirus",
    vendor: "ESET",
    category: "Антивирус",
    signatures: ["ESET Endpoint Antivirus"],
  },
  {
    id: "eset-security",
    name: "ESET Endpoint Security",
    vendor: "ESET",
    category: "Антивирус",
    signatures: ["ESET Endpoint Security"],
  },
  {
    id: "nod32",
    name: "ESET NOD32 Antivirus",
    vendor: "ESET",
    category: "Антивирус",
    signatures: ["ESET NOD32", "NOD32 Antivirus"],
  },
  {
    id: "defender",
    name: "Microsoft Defender Antivirus",
    vendor: "Microsoft",
    category: "Антивирус",
    signatures: [
      "Microsoft Defender Antivirus",
      "Windows Defender",
      "Антивирус Microsoft Defender",
      "Защитник Windows",
      "MsMpEng.exe",
    ],
  },
  {
    id: "mse",
    name: "Microsoft Security Essentials",
    vendor: "Microsoft",
    category: "Антивирус",
    signatures: ["Microsoft Security Essentials"],
  },
  {
    id: "symantec",
    name: "Symantec Endpoint Protection",
    vendor: "Broadcom / Symantec",
    category: "Антивирус",
    signatures: ["Symantec Endpoint Protection"],
  },
  {
    id: "trellix",
    name: "Trellix / McAfee Endpoint Security",
    vendor: "Trellix",
    category: "Антивирус",
    signatures: [
      "Trellix Endpoint Security",
      "McAfee Endpoint Security",
      "McAfee VirusScan Enterprise",
    ],
  },
  {
    id: "sophos",
    name: "Sophos Endpoint",
    vendor: "Sophos",
    category: "Антивирус",
    signatures: ["Sophos Endpoint", "Sophos Intercept X", "Sophos Anti-Virus"],
  },
  {
    id: "bitdefender",
    name: "Bitdefender Endpoint Security Tools",
    vendor: "Bitdefender",
    category: "Антивирус",
    signatures: [
      "Bitdefender Endpoint Security",
      "Bitdefender Antivirus",
      "Bitdefender Total Security",
    ],
  },
  {
    id: "avast",
    name: "Avast Antivirus",
    vendor: "Gen Digital",
    category: "Антивирус",
    signatures: ["Avast Free Antivirus", "Avast Business", "Avast Premium Security"],
  },
  {
    id: "avg",
    name: "AVG Antivirus",
    vendor: "Gen Digital",
    category: "Антивирус",
    signatures: ["AVG AntiVirus", "AVG Internet Security"],
  },
  {
    id: "avira",
    name: "Avira Antivirus",
    vendor: "Avira",
    category: "Антивирус",
    signatures: ["Avira Antivirus", "Avira Free Security", "Avira Security"],
  },
  {
    id: "trend",
    name: "Trend Micro Endpoint Security",
    vendor: "Trend Micro",
    category: "Антивирус",
    signatures: ["Trend Micro Apex One", "Trend Micro OfficeScan", "Trend Micro Security Agent"],
  },
  {
    id: "clamav",
    name: "ClamAV",
    vendor: "Cisco / ClamAV",
    category: "Антивирус",
    signatures: ["ClamAV", "ClamWin", "clamscan", "clamd"],
  },
  {
    id: "secret-net",
    name: "Secret Net",
    vendor: "Код Безопасности",
    category: "СЗИ",
    signatures: ["Secret Net Studio", "Secret Net", "Секрет Нет"],
  },
  {
    id: "vips",
    name: "ViPNet Client",
    vendor: "ИнфоТеКС",
    category: "СЗИ",
    signatures: ["ViPNet Client", "ViPNet CSP", "ViPNet Coordinator"],
  },
  {
    id: "cryptopro",
    name: "КриптоПро CSP",
    vendor: "КриптоПро",
    category: "СЗИ",
    signatures: ["КриптоПро CSP", "CryptoPro CSP"],
  },
  {
    id: "kontinent",
    name: "Континент",
    vendor: "Код Безопасности",
    category: "СЗИ",
    signatures: ["Континент-АП", "Континент АП", "Континент TLS", "Continent Client"],
  },
  {
    id: "sobol",
    name: "Соболь",
    vendor: "Код Безопасности",
    category: "СЗИ",
    signatures: ["ПАК Соболь", "Соболь"],
  },
  {
    id: "dallas",
    name: "Dallas Lock",
    vendor: "Конфидент",
    category: "СЗИ",
    signatures: ["Dallas Lock"],
  },
  {
    id: "infowatch",
    name: "InfoWatch Traffic Monitor",
    vendor: "InfoWatch",
    category: "СЗИ",
    signatures: ["InfoWatch Traffic Monitor", "InfoWatch Device Monitor"],
  },
  {
    id: "searchinform",
    name: "СёрчИнформ КИБ",
    vendor: "СёрчИнформ",
    category: "СЗИ",
    signatures: ["СёрчИнформ КИБ", "SearchInform", "СёрчИнформ"],
  },
  {
    id: "device-lock",
    name: "DeviceLock",
    vendor: "DeviceLock",
    category: "СЗИ",
    signatures: ["DeviceLock"],
  },
  {
    id: "zecurion",
    name: "Zecurion DLP",
    vendor: "Zecurion",
    category: "СЗИ",
    signatures: ["Zecurion DLP", "Zecurion Endpoint", "Zlock"],
  },
];

export const CATALOG_VERSION = "1.0";
export const normalizeSignature = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
export function searchSecurityCatalog(
  query: string,
  category: SecurityCategory | "" = "",
): SecurityProduct[] {
  const q = normalizeSignature(query);
  return SECURITY_CATALOG.filter(
    (product) =>
      (!category || product.category === category) &&
      (!q ||
        [product.name, product.vendor, ...product.signatures].some((s) =>
          normalizeSignature(s).includes(q),
        )),
  );
}

export type LocalProgramMatch = {
  input: string;
  matches: { product: SecurityProduct; signatures: string[] }[];
};
export function matchSecurityPrograms(input: string): LocalProgramMatch[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Versions and publishers are not evidence of product identity.
      const name = ` ${normalizeSignature(line.split(";")[0] ?? "")} `;
      const matches = SECURITY_CATALOG.flatMap((product) => {
        const signatures = product.signatures.filter((s) =>
          name.includes(` ${normalizeSignature(s)} `),
        );
        return signatures.length ? [{ product, signatures }] : [];
      });
      return { input: line, matches };
    });
}

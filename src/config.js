/**
 * Application configuration
 */

// Ad configuration: toggle between AdSense and custom ads
export const USE_ADSENSE = false;

// Default CIDR for reset button
export const DEFAULT_CIDR = "10.0.0.0/8";

// Valid output format modes
export const OUTPUT_MODES = ["json", "yaml", "html"];

// Output format hints/descriptions
export const OUTPUT_HINTS = {
  json: "JSON reflects data in above table (realtime)",
  yaml: "YAML reflects data in above table (realtime)",
  html: "HTML is a static table of leaf subnets only (realtime)"
};

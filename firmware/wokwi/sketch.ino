// BlueMark FPV — Simulated drone-side firmware marker generation.
//
// Runs in the Wokwi ESP32 web simulator (https://wokwi.com/). The cryptographic
// payload format is byte-identical to the Python receiver in src/bluemark/marker.py
// — markers produced here verify cleanly on the receiver side without any glue
// code. See scripts/verify_firmware_marker.py for the cross-language test.
//
// In a real Betaflight fork:
//   - Replace `Serial.println(marker)` with a VBI write routine targeting OSD
//     chip lines 17-20 (MAX7456 / AT7456 family) past the chip's safe-area
//     restrictions. See docs/steganographic_iff.md.
//   - Replace `delay(1000)` with the per-frame hook (~16ms at 60fps NTSC).
//   - Replace `demo_ts++` with the FC's actual time source (rolling counter).
//   - The HMAC + payload format below does not change.
//
// Identification aid only. Human decision required.

#include <Arduino.h>
#include <mbedtls/md.h>
#include <string.h>

// ----- Configuration (provisioned at flash time in production) ---------------

static const char SECRET[]      = "hackathon-demo-secret-not-real";
static const char MISSION_ID[]  = "MISSION-2026-05-02-A";

// Synthetic timestamp baseline — production reads from FC's clock / RTC.
// Matches the fixture timestamp used in demo_assets/mission_manifest.json.
static uint32_t demo_ts = 1746208900;

// ----- Hex encoding ----------------------------------------------------------

static void to_hex(const uint8_t *bytes, size_t n, char *out) {
  static const char hex[] = "0123456789abcdef";
  for (size_t i = 0; i < n; i++) {
    out[2 * i]     = hex[bytes[i] >> 4];
    out[2 * i + 1] = hex[bytes[i] & 0x0f];
  }
  out[2 * n] = '\0';
}

// ----- HMAC-SHA256 via mbedtls (built-in to Arduino-ESP32) -------------------

static void hmac_sha256(const uint8_t *key, size_t keylen,
                        const uint8_t *msg, size_t msglen,
                        uint8_t out[32]) {
  mbedtls_md_context_t ctx;
  const mbedtls_md_info_t *info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, info, 1 /* hmac */);
  mbedtls_md_hmac_starts(&ctx, key, keylen);
  mbedtls_md_hmac_update(&ctx, msg, msglen);
  mbedtls_md_hmac_finish(&ctx, out);
  mbedtls_md_free(&ctx);
}

// ----- Marker generation -----------------------------------------------------
// Format: <mission_id>:<unix_ts>:<hex_hmac32>
// HMAC-SHA256 of "<mission_id>:<unix_ts>" with SECRET, truncated to 16 bytes /
// 32 hex chars. Matches src/bluemark/marker.py::make_marker exactly.

static void make_marker(const char *mission, uint32_t ts,
                        char *marker_out, size_t out_size) {
  char    payload[64];
  uint8_t hmac[32];
  char    hmac_hex[33];

  snprintf(payload, sizeof(payload), "%s:%lu", mission, (unsigned long)ts);
  hmac_sha256((const uint8_t *)SECRET, strlen(SECRET),
              (const uint8_t *)payload, strlen(payload),
              hmac);
  to_hex(hmac, 16, hmac_hex); // truncate to 16 bytes = 32 hex chars
  snprintf(marker_out, out_size, "%s:%lu:%s",
           mission, (unsigned long)ts, hmac_hex);
}

// ----- Arduino lifecycle -----------------------------------------------------

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("================================================================");
  Serial.println("BlueMark FPV — simulated FC marker generation (Wokwi ESP32)");
  Serial.println("Per-frame HMAC-SHA256 marker. Format identical to");
  Serial.println("src/bluemark/marker.py. Cross-language compatibility test:");
  Serial.println("  python scripts/verify_firmware_marker.py '<marker-line>'");
  Serial.println("================================================================");
  Serial.println();
}

void loop() {
  char marker[128];
  make_marker(MISSION_ID, demo_ts, marker, sizeof(marker));
  Serial.print("[VBI line 17-20 write] ");
  Serial.println(marker);
  demo_ts++;
  delay(1000); // 1 Hz for readable demo output; production runs per-frame.
}

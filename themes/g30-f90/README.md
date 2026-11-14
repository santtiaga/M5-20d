# BMW G30 / G31 F90 M Cluster

Native idv7lol theme source for BMW G31 LCI 520d B47 MHEV Stage 1 (245 hp / 528 Nm).

## Tachometer
- Range 0–5000 rpm.
- Angular allocation: 0–2000 = 32%; 2000–4500 = 60%; 4500–5000 = 8%.
- Five sub-ranges: 0–1000, 1000–2000, 2000–4000, 4000–4500, 4500–5000 rpm.
- Angular allocation: 0–2000 = 32% (86.4°), 2000–4500 = 60% (162°), 4500–5000 = 8% (21.6°) of the 270° sweep.
- Yellow zone 4000–4500 rpm; red zone 4500–5000 rpm.
- Implemented as five native gauge.arc components with local min/max bindings.

## Vehicle signals
Uses vehicle profile `g30-b47-mhev` and the current idv7lol catalog: engine rpm, speed, torque, power, boost, oil/coolant temperature, transmission gear/mode and transmission oil temperature. Rated 245 hp / 528 Nm are metadata, not forced live readings.

## 48 V MHEV limitation
The G30 B47 MHEV profile is selected, but the runtime does not yet publish verified BATT48 / PCU48 values. Candidate diagnostic addresses and DIDs found in eDrive research remain unconfirmed on this car. No 48 V SOC, voltage, current or power is fabricated. A read-only probe and raw replies from the actual vehicle are required before decoding and polling can be enabled.

## Renderer budget
The current component configuration compiles to an estimated 44 renderer layers (hard per-app limit 64; recommended budget 48). This leaves 20 layers below the hard limit and 4 below the recommended budget. The definitive count is the compiler's `compiled.layers` value in Studio Build & Deploy.

## Install on the car
Open this file in idv7lol Studio. Run theme validation, then **Build & Deploy → Compile theme → Save for the car (USB)**. Copy the generated `.idv7pkg` to `idv7lol/themes/` on the USB stick, connect it to the MGU and select it in idv7lol. A compatible idv7lol app and cluster-render must already be installed.

## Renderer limitation
Theme packages cannot ship arbitrary GLSL. Custom shaders must be integrated into the application/compiler and built into the app. This theme uses supported built-in components so it can be compiled as a normal USB theme.

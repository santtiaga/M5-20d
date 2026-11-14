# BMW G30 / G31 F90 M Cluster

Native idv7lol theme source for BMW G31 LCI 520d B47 MHEV Stage 1 (245 hp / 528 Nm).

## Tachometer
- Range 0–5000 rpm.
- Angular allocation: 0–2000 = 32%; 2000–4500 = 60%; 4500–5000 = 8%.
- Five sub-ranges: 0–1000, 1000–2000, 2000–3250, 3250–4500, 4500–5000 rpm.
- Yellow zone 4000–4500 rpm; red zone 4500–5000 rpm.
- Implemented as five native gauge.arc components with local min/max bindings.

## Vehicle signals
Uses the current idv7lol catalog: engine rpm, speed, torque, power, boost, oil/coolant temperature, transmission gear/mode and transmission oil temperature. Rated 245 hp / 528 Nm are metadata, not forced live readings.

## 48 V MHEV limitation
The current vehicle adapter does not expose BATT48 / PCU48 values. No 48 V SOC, voltage, current or power is fabricated. A dedicated provider is required before those readings can be displayed.

## Install on the car
Open this file in idv7lol Studio. Run theme validation, then **Build & Deploy → Compile theme → Save for the car (USB)**. Copy the generated `.idv7pkg` to `idv7lol/themes/` on the USB stick, connect it to the MGU and select it in idv7lol. A compatible idv7lol app and cluster-render must already be installed.

## Renderer limitation
Theme packages cannot ship arbitrary GLSL. Custom shaders must be integrated into the application/compiler and built into the app. This theme uses supported built-in components so it can be compiled as a normal USB theme.

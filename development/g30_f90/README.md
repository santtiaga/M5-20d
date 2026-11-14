# G30 F90 renderer development

The installable first pass is maintained in `themes/g30-f90/theme.json` and uses only native idv7lol theme components. The earlier standalone GLSL/JavaScript renderer prototype is not copied into the car app because MGU theme packages cannot load arbitrary shaders.

Future renderer work belongs in the idv7lol application/compiler: extend the built-in shader catalog and component compiler, add a B47 MHEV data provider, then regenerate the MGU app artifacts with `npx tsx tools/build/build-mgu-themes.ts`. Do not add `.frag` files to a theme package expecting the MGU to execute them.

Vehicle target: BMW G31 LCI 520d MHEV, B47D20B, Stage 1, 245 hp / 528 Nm, 8HP51, RWD.

The current vehicle signal catalog exposes engine RPM, speed, torque, power, boost, oil/coolant temperature, gearbox temperature, gear and drive mode. It does not currently expose BATT48 / PCU48 data; that requires a dedicated UDS/SOME-IP provider and must not be simulated as live vehicle data.

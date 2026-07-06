My daily driver is a Framework 16 running Arch, Hyprland, and a hand-written Quickshell bar, all tuned to one matte black palette. At my desk it docks to an **EVGA RTX 3080 Ti** over a raw PCIe cable through the laptop's expansion bay. Everything below — the compositor config, the theme, the eGPU wiring, the bootloader — was built and debugged in an ongoing back-and-forth with **Claude Code**: bare Arch terminal to the desktop in the photo below took a day and a half, work that would otherwise have taken me weeks to write by hand. This is the write-up of how it fits together.

![The finished matte black Hyprland desktop, showing a neofetch readout in Alacritty over a dark wave wallpaper.](/blog/oculink-egpu/hero.jpg)

*The actual desktop, mid-session — Hyprland + Quickshell, matte black theme, RTX 3080 Ti docked.*

```
michael@framework16 ~/dotfiles $ neofetch

OS              Arch Linux x86_64
Host            Framework Laptop 16
WM              Hyprland (config in Lua, not hyprlang)
Bar             Quickshell 0.3.0 — hand-written QML
CPU             AMD Ryzen AI 9 HX 370
GPU (internal)  AMD Radeon 890M
GPU (docked)    NVIDIA RTX 3080 Ti via OCuLink
Display         2560x1600 @ 165Hz, BOE NE160QDM-NZ6
Terminal        Alacritty, JetBrainsMono Nerd Font
Theme           Matte Black — custom GTK + Kvantum + QML
```

## Why a Framework 16

The pitch for Framework was always the expansion bay: a laptop that ships with a literal empty slot on the back, meant to be filled with whatever module you want. That's not a nice-to-have for this build — it's the entire reason the eGPU mod is possible at all. Framework has since started selling an official [OCuLink Dev Kit](https://frame.work/products/framework-oculink-dev-kit) for exactly this (up to 128 Gbps bidirectional over 8 PCIe lanes by their own numbers, per the [OCuLink announcement](https://frame.work/blog/framework-laptop-16-upgrades-and-oculink-dev-kit)), but the mod predates the official kit as a community discovery: a Dual M.2 expansion bay module with an OCuLink adapter seated in one of its M.2 slots turns the bay's PCIe lanes into a standard external OCuLink connector. No Thunderbolt authorization, no `bolt` daemon — it's raw PCIe, which is both the appeal and, as below, the catch.

## Zero to desktop in a day and a half

Everything below started from a bare Arch terminal — no desktop, no bootloader configured beyond the installer defaults, nothing to build on. Writing a Hyprland and Quickshell setup like this by hand, keybind by keybind, module by module, with a theme that has to agree with itself across three toolkits, is normally a weeks-long project. Doing it end-to-end with Claude Code, from that first prompt to the desktop in the screenshot above, took a day and a half.

The bootloader was its own small saga. This box boots [Limine](https://github.com/limine-bootloader/limine) straight into a btrfs root, so a bad `pacman` update is a reboot into last night's snapshot from the boot menu, not a rescue USB. Getting there wasn't immediately smooth — the first answer out of Claude Code was that btrfs, Limine, and a Linux UKI (unified kernel image) together simply wasn't a supported combination. It took pointing it at [basecamp/omarchy](https://github.com/basecamp/omarchy) — DHH's opinionated Arch + Hyprland distro, which ships exactly that combination — for it to find the actual working recipe and get it wired up correctly. Worth remembering for next time: "not possible" from an LLM sometimes just means it hasn't looked at the one repo that already does it.

The desktop itself — Hyprland's animation curves and window rules, the Quickshell bar built module by module, the matte black theme spanning GTK, Qt, and QML — was designed by Claude Code from almost nothing: a nudge to look at Omarchy's wiki for the general shape of a modern Hyprland setup, and a color brief (the `#121212` / `#e68e0d` matte black ramp used throughout). Everything downstream of that single conversation — the module layout in `hyprland.lua`, the palette propagated out into GTK and Kvantum, the bar assembled piece by piece in Quickshell — is what's described in the rest of this post.

## GNU Stow, and a bar built from nothing

The dotfiles are managed with [GNU Stow](https://www.gnu.org/software/stow/), one package per concern — `hypr`, `quickshell`, `localbin`, `gtk`, `qt`, `uwsm`, `alacritty`, `shell`, `webapps`. Stow symlinks every tracked file straight from the repo into `~/.config`, so there's no deploy step for a content edit — the live config *is* the repo file. The one rule that matters: edit the repo path, never the symlink target. An editor that saves atomically (write a temp file, then rename over) can silently replace the symlink with a plain file, and the link is gone without any error.

Hyprland here is configured in **Lua**, not the usual hyprlang `.conf`. `hyprland.lua` is the entry point, and it loads every module by *absolute path* via `loadfile()` — plain `require("modules.x")` doesn't resolve in this build, so the config avoids it outright:

> load("modules/monitors.lua") — displays
> load("modules/envs.lua") — environment variables
> load("modules/bindings.lua") — keybinds
> load("modules/autostart.lua") — launched once on session start

The bar and control center are Quickshell — no `qmldir`, just hand-written QML files that resolve by filename. `Theme.qml` and `Sys.qml` are `pragma Singleton` and hold the palette and cross-component state respectively (airplane mode mirrors `rfkill`, auto-brightness owns the sensor process). Even the battery readout got a small correction: this machine's BIOS caps charging at 80% for battery longevity, so the bar displays charge as a fraction of that cap rather than the raw percentage — a capped-full pack reads 100%, the way it should.

## One palette, three toolkits

"Matte black" is one specific ramp — `#121212` background up through `#1e1e1e` surfaces, `#bebebe` text, `#e68e0d` orange accent — defined once in Quickshell's `Theme.qml` and then hand-carried into GTK and Qt so nothing looks like a different app wandered in.

GTK was the easy half: both `adw-gtk3` (GTK3) and libadwaita (GTK4) expose their colors as named variables, so recoloring is a CSS override file per version. Qt was the harder half, because Kvantum needs an actual *style*, not just a palette. The theme here, `MatteBlack`, is vendored from [KvLibadwaita](https://github.com/GabePoel/KvLibadwaita) and recolored from its mid-grey-and-blue original to the matte ramp — after rejecting two other candidate bases first: one had 3D-beveled widgets, the other had blue baked directly into its SVG and square (not rounded) menus. The recolor is a single-pass regex hex remap over the theme's SVG and `.kvconfig`, so it's reproducible if the base theme ever needs a refresh.

Two gotchas cost real debugging time and are worth naming directly. First: `qt6ct` has to leave `custom_palette=false` and let Kvantum own the palette entirely — turning palette overrides back on layers qt6ct's colors on top of Kvantum's and produces subtly wrong selection and disabled-state tints. Second, and more annoying: the `qt6ct` and Kvantum Manager GUIs both save atomically, which means opening either one and clicking "Apply" silently de-stows the config file it touched, replacing the symlink with a plain file. The fix is procedural, not technical — never open those GUIs to make a change; patch the repo file directly and reload.

## Docking an RTX 3080 Ti over OCuLink

The physical build is the community route rather than Framework's packaged kit: a third-party M.2-to-OCuLink adapter card seated in a Dual M.2 expansion bay module, an OCuLink cable sourced off Amazon rather than whatever a kit would have shipped with, and a small bezel — 3D-printed, since the module's shell has no factory cutout for a cable — to route it out cleanly. On the other end of that cable is an EVGA RTX 3080 Ti (Ampere GA102) on the open-source-friendly `nvidia-open` driver. One constraint discovered early on ended up shaping almost every decision that followed:

![The Framework 16 opened up on a table, expansion bay module and M.2-to-OCuLink adapter laid out next to the OCuLink cable and tools, mid-install.](/blog/oculink-egpu/install.jpg)

*Mid-install: the expansion bay module, the M.2-to-OCuLink adapter, and the Amazon cable, laid out before reassembly.*

![Close-up of the OCuLink cable exiting a 3D-printed bezel on the back edge of the laptop.](/blog/oculink-egpu/cable.jpg)

*The cable exiting the 3D-printed bezel — no factory cutout existed for this.*

> **HARDWARE CONSTRAINT** — On this machine, the eGPU sits behind an SoC root port (`00:03.3`) that exposes no PCIe hotplug slot. That makes it **connect-at-boot only** — it can never be hot-unplugged while the session is live without risking a hung PCIe bus.

Once "boot-time hardware, full stop" was the rule, the rest of the setup followed from it.

**eGPU-primary when docked.** The first pass ran the AMD 890M as primary compositor with the eGPU's external monitors composited through it — the obvious layout, since the iGPU drives the internal panel either way. It produced odd NVIDIA utilization spikes that looked like a driver problem. They weren't: the card itself idled fine (P8, fan off); the cost was the cross-GPU copy on every frame for the externally connected displays. The fix was to flip which GPU is primary — when docked, the RTX 3080 Ti composites its own monitors directly and renders games natively, while the 890M stays dedicated to the internal `eDP-1` panel. No more copy path, no more spikes.

**Docked vs. mobile, decided automatically.** A small script, `egpu-drm-devices`, runs at every login and resolves the live `/dev/dri` device nodes by PCI vendor ID — `cardN` numbers aren't stable across boots, so they're never hardcoded. It emits `AQ_DRM_DEVICES` for Hyprland's Aquamarine backend (NVIDIA first when docked, AMD-only when mobile) and flips on `GBM_BACKEND=nvidia-drm` plus `__GLX_VENDOR_LIBRARY_NAME=nvidia` only when the card is actually present. Undock the laptop and take it to a coffee shop, and the exact same config just runs iGPU-only — no separate profile, no manual step.

**The boot race nobody warns you about.** The eGPU's DisplayPort outputs register a beat after the internal panel does. Starting Quickshell or setting the wallpaper immediately on session start — before Hyprland's monitor list had settled — produced blank, non-painting bars on the external monitors, or a wallpaper that only ever reached one screen. Both `qs-start` and `wallpaper.sh` now poll `hyprctl monitors` in a tight loop and wait for the monitor count to stop changing (docked expects the panel plus at least one external output) before doing anything, with a ~12-second ceiling so a genuinely stuck boot still proceeds. Same script, works identically whether one monitor shows up or three.

![The finished desk setup: the Framework 16 to the side, a dual-monitor arrangement in front of it, and the eGPU enclosure with RGB lighting visible under the desk.](/blog/oculink-egpu/desk.jpg)

*The payoff: docked, both externals lit up off the eGPU, laptop panel free to run something else.*

One more fix landed in the same session, unrelated to the GPU but same night's work: Quickshell's Bluetooth panel talks to BlueZ directly but never registers a pairing agent, so newly paired devices never reconnected automatically after a reboot. A `bt-agent` autostart entry now handles the just-works pairing prompt, and the QML explicitly sets `d.trusted = true` the moment a device finishes bonding — PIN-less devices don't persist trust on their own.

## Where Claude Code actually helped

The useful part of building this with Claude Code wasn't code generation — most of these files are short and specific to one machine, and the day-and-a-half build speed above wasn't about typing faster. It was the debugging discipline: chasing the NVIDIA utilization spikes back to a copy-path problem instead of a driver bug, and tracing the blank-bar issue back to a monitor-registration race instead of "just add a sleep and hope." Both fixes above read as one or two lines, but getting to the actual cause — `root port with no hotplug slot`, or `DisplayPort outputs register late` — is the part that took the back-and-forth.

A couple of habits made that back-and-forth work instead of making a mess: patch the real file in place rather than stacking a workaround around it (the eGPU commit touches exactly seven files, all load-bearing, nothing incidental); respect the Stow symlink model by always editing the repo path, never the live config; and verify against the actual running system after every change — `quickshell log` for a QML edit, `hyprctl monitors` after a display change — rather than assuming a diff did what it looks like it should do.

## What I'd tell someone trying this

- If your eGPU sits behind a root port with no hotplug slot, design around that as boot-time hardware from day one — don't discover it by hot-unplugging and hanging the bus.
- An NVIDIA utilization spike on an otherwise-idle card is worth checking the compositing path before assuming it's a driver problem — cross-GPU copies can look exactly like that.
- Detect dock state at login and branch on it automatically. Two hand-maintained configs will drift; one script that resolves live device state won't.
- When one theme has to span GTK, Qt, and a custom QML bar, pick one file as the source of truth for the palette and derive the rest from it deliberately, rather than eyeballing three configs into rough agreement.
- Never edit a Stow-managed config through a GUI's save button. If it can save atomically, it can silently break the symlink.

The full config — every Lua module, every QML file, the Kvantum theme, the helper scripts — is up at [github.com/sipesdev/dotfiles](https://github.com/sipesdev/dotfiles). Stow-managed, one package per concern; clone it and `make stow` if you want to see how any piece of this actually reads.

> **BEFORE YOU CLONE IT** — The hardware IDs, my home directory, and a handful of other values throughout this repo are hardcoded to this specific machine — it's built to run on my Framework 16, not as a general-purpose template. Don't expect `make stow` to give you a working desktop on different hardware out of the box. What's worth lifting directly is the logic in the standalone scripts — the live login-time eGPU detection and GPU-primary switching in `egpu-drm-devices` and `~/.config/uwsm/env` chief among them — those read and copy cleanly on their own.

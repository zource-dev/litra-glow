# Litra

Opensource Cross-platform Logitech® Litra Glow control

## Requirements

### Linux

```bash
sudo echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="046d", ATTR{idProduct}=="c900", MODE="0666"' > /etc/udev/rules.d/50-litra-glow.rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Download

Please check [releases](https://github.com/zource-dev/litra-glow/releases) for downloads

## Screenshot

![Logitech® Litra Glow UI](assets/screenshot.jpg 'Logitech® Litra Glow UI')

## License

Copyright 2022 Ivan Zakharchanka [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0)

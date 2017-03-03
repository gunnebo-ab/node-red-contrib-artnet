[![Go to Gunnebo](logo.png)](http://gunnebo.com)

# node-red-contrib-artnet
Node-RED node that controls lights via artnet

[Gunnebo](http://www.gunnebo.com/)  (OMX: GUNN) is a multinational corporation headquartered in Gothenburg, Sweden, specializing in security products, services and solutions mainly in the areas of cash management, entrance security, electronic security and safes & vaults. The Gunnebo Group has operations in 32 countries with approximately 5,500 employees (Jan 2016) and a reported global revenue of €660 million for 2015. Gunnebo has been listed on the Stockholm Stock Exchange in Sweden since 1994 and can be found on the NASDAQ OMX Nordic Exchange Stockholm in the Mid Cap Industrials segment.

## Install

Run the following command in the root directory of your Node-RED install. Usually this is `~/.node-red`
```
npm install node-red-contrib-artnet
```

## Using

You can either set a single channel like the following example:

```
msg.payload = {
  channel: 1, // int: address in [1, 512]
  value: 255  // int: value in [0, 255]
};
```

Or you can set multiple channels at once:

```
msg.payload = {
  buckets: [
    {channel: 1, value: 255},
    {channel: 4, value: 0},
  ]
};
```

You can also fade to values, either for a single channel or multiple channels. You should specify the 'transition' and also a 'duration' in milliseconds:

```
msg.payload={
    transition: "linear",
    duration: 5000,
    buckets: [
      {channel: 1, value: 255},
      {channel: 4, value: 0},
    ]
}
```

In order to perform arc transition (movement by arc) you shold specify more details:

```
msg.payload = {
    transition: "arc",
    duration: 2000,
    arc: {
        pan_channel: 1,
        tilt_channel: 3,
        pan_angle: 540,
        tilt_angle: 255
    },
    start: {pan: 0, tilt: 44},
    center: {pan: 127.5, tilt: 63.75},
    end: {pan: 85, tilt: 44}
};
```
where

- `arc` - channels that should be involved in arc transition (pan and tilt channels)
- `start` - initial channel's values (start point). By default: current channel's values.
- `center` - "center point" values
- `end` - terminal channel's values (end point)

In example above moving head will move by arc starting from {pan: 0, tilt: 44} to {pan: 85, tilt: 44}. Center point ({pan: 127.5, tilt: 63.75}) defines nominal circle center.
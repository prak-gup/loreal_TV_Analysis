import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, ReferenceLine } from "recharts";

// Raw data embedded (from CSV)
const rawData = [
  {Region:"AP",Channel:"abn andhra jyothi",Genre:"Telugu News",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:905388.95,Impact:45.1187,Cost:46440,Spots:180,OTS:3.04,SyncReach:8.19,Impressions:2689.68,GRP:28.41},
  {Region:"AP",Channel:"etv andhra pradesh",Genre:"Telugu News",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:269067.62,Impact:0.9662,Cost:7752,Spots:19,OTS:1.54,SyncReach:1.91,Impressions:66.23,GRP:0.7},
  {Region:"AP",Channel:"etv telugu",Genre:"Telugu GEC",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7554666.65,Impact:80.4831,Cost:312700,Spots:59,OTS:2.87,SyncReach:21.855,Impressions:6809.06,GRP:71.93},
  {Region:"AP",Channel:"gemini comedy",Genre:"Telugu Comedy",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1287106.24,Impact:28.5076,Cost:42586,Spots:107,OTS:1.97,SyncReach:6.28,Impressions:1516.37,GRP:16.02},
  {Region:"AP",Channel:"gemini life",Genre:"Telugu Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1819975.81,Impact:12.6144,Cost:18980,Spots:73,OTS:1.77,SyncReach:5.735,Impressions:1239.34,GRP:13.09},
  {Region:"AP",Channel:"gemini movies",Genre:"Telugu Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5567801.11,Impact:79.1927,Cost:91140,Spots:70,OTS:2.39,SyncReach:16.55,Impressions:4587.76,GRP:48.47},
  {Region:"AP",Channel:"gemini movies hd",Genre:"Telugu Movies HD",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:553828.38,Impact:29.3807,Cost:26568,Spots:246,OTS:3.63,SyncReach:4.75,Impressions:1479.14,GRP:15.63},
  {Region:"AP",Channel:"gemini music",Genre:"Telugu Music",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1033255.8,Impact:121.7975,Cost:236736,Spots:432,OTS:3.23,SyncReach:19.605,Impressions:6660.86,GRP:70.37},
  {Region:"AP",Channel:"gemini tv",Genre:"Telugu GEC",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6010088.35,Impact:115.2993,Cost:607824,Spots:168,OTS:3.27,SyncReach:28.51,Impressions:10350.29,GRP:109.34},
  {Region:"AP",Channel:"gemini tv hd",Genre:"Telugu GEC HD",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:581770.19,Impact:16.8165,Cost:57280,Spots:179,OTS:4.07,SyncReach:3.65,Impressions:1315.76,GRP:13.9},
  {Region:"AP",Channel:"ntv telugu",Genre:"Telugu News",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1346596.41,Impact:3.8609,Cost:4860,Spots:6,OTS:1.14,SyncReach:2.155,Impressions:205.36,GRP:2.17},
  {Region:"AP",Channel:"star maa",Genre:"Telugu GEC",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:24387048.38,Impact:126.0151,Cost:685768,Spots:46,OTS:3.28,SyncReach:32.06,Impressions:11597.47,GRP:122.52},
  {Region:"AP",Channel:"star maa gold",Genre:"Telugu Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3050841.33,Impact:40.6738,Cost:55440,Spots:168,OTS:2.26,SyncReach:14.145,Impressions:3919.31,GRP:41.4},
  {Region:"AP",Channel:"star maa hd",Genre:"Telugu GEC HD",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2339717.8,Impact:18.6452,Cost:75720,Spots:60,OTS:6.84,SyncReach:3.705,Impressions:2145.14,GRP:22.66},
  {Region:"AP",Channel:"star maa movies",Genre:"Telugu Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7089393.73,Impact:224.3365,Cost:246420,Spots:185,OTS:4.01,SyncReach:30.1,Impressions:13282.41,GRP:140.32},
  {Region:"AP",Channel:"star maa music",Genre:"Telugu Music",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3205686.57,Impact:95.0176,Cost:44528,Spots:121,OTS:2.89,SyncReach:14.61,Impressions:4988.87,GRP:52.7},
  {Region:"AP",Channel:"t news",Genre:"Telugu News",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:84264.65,Impact:7.8077,Cost:120350,Spots:415,OTS:1.76,SyncReach:2.29,Impressions:481.21,GRP:5.08},
  {Region:"AP",Channel:"vanitha tv",Genre:"Telugu GEC",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:218150.22,Impact:11.276,Cost:80910,Spots:261,OTS:1.67,SyncReach:4.155,Impressions:665.7,GRP:7.03},
  {Region:"AP",Channel:"zee cinemalu",Genre:"Telugu Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5513361.47,Impact:127.0567,Cost:141550,Spots:95,OTS:2.93,SyncReach:23.465,Impressions:7461.35,GRP:78.82},
  {Region:"AP",Channel:"zee cinemalu hd",Genre:"Telugu Movies HD",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:747580.73,Impact:40.8423,Cost:127370,Spots:271,OTS:4.36,SyncReach:5.4,Impressions:2564.32,GRP:27.09},
  {Region:"AP",Channel:"zee telugu",Genre:"Telugu GEC",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:21227502.83,Impact:254.7741,Cost:892248,Spots:94,OTS:6.51,SyncReach:36.325,Impressions:24735.21,GRP:261.31},
  {Region:"AP",Channel:"zee telugu hd",Genre:"Telugu GEC HD",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2089823.39,Impact:24.9926,Cost:135222,Spots:93,OTS:6.3,SyncReach:5.17,Impressions:2735.19,GRP:28.89},
  {Region:"HSM",Channel:"&pictures",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:11290168.24,Impact:164.750165,Cost:2869775,Spots:670,OTS:1.702,SyncReach:7.23,Impressions:15209.19,GRP:77.59},
  {Region:"HSM",Channel:"&pictures",Genre:"Hindi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:11290168.24,Impact:136.973,Cost:1373130,Spots:365,OTS:1.9,SyncReach:4.119,Impressions:7816.23,GRP:38.35},
  {Region:"HSM",Channel:"&pictures hd",Genre:"Hindi Movies HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:866845.66,Impact:0.091649919,Cost:0,Spots:30,OTS:0.4,SyncReach:1.481,Impressions:13.39,GRP:0.05},
  {Region:"HSM",Channel:"&tv",Genre:"Hindi GEC 2",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:5007783.34,Impact:114.9065778,Cost:2385687.5,Spots:1110,OTS:3.712,SyncReach:4.866,Impressions:17442.86,GRP:97.07},
  {Region:"HSM",Channel:"&tv",Genre:"Hindi GEC 2",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5007783.34,Impact:36.9202,Cost:2224430,Spots:355,OTS:1.668,SyncReach:2.619,Impressions:3952.6,GRP:20.11},
  {Region:"HSM",Channel:"&tv hd",Genre:"Hindi GEC 2 HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:328547.77,Impact:67.41163007,Cost:0,Spots:505,OTS:3.024,SyncReach:1.341,Impressions:726.08,GRP:4.13},
  {Region:"HSM",Channel:"9x jalwa",Genre:"Hindi Music",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:667236.39,Impact:6.8972,Cost:439920,Spots:470,OTS:0.86,SyncReach:1.168,Impressions:486.28,GRP:1.69},
  {Region:"HSM",Channel:"9xm",Genre:"Hindi Music FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3282994.41,Impact:209.3342,Cost:2317680,Spots:1160,OTS:2.65,SyncReach:4.798,Impressions:12481.95,GRP:62.18},
  {Region:"HSM",Channel:"all time movies",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6007033.61,Impact:19.8055,Cost:16240,Spots:70,OTS:1.332,SyncReach:1.421,Impressions:1163.35,GRP:5.42},
  {Region:"HSM",Channel:"anmol cinema",Genre:"Hindi GEC FTA",Language:"multi",Brand:"garnier black naturals",ViewingMinutes:11304679.97,Impact:42.81468286,Cost:880005,Spots:320,OTS:1.478,SyncReach:4.053,Impressions:6893.87,GRP:38.75},
  {Region:"HSM",Channel:"anmol cinema",Genre:"Hindi GEC FTA",Language:"multi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:11304679.97,Impact:301.0334,Cost:2430360,Spots:1570,OTS:2.758,SyncReach:10.733,Impressions:32515.07,GRP:179.15},
  {Region:"HSM",Channel:"anmol cinema 2",Genre:"Hindi Movies",Language:"multi",Brand:"garnier black naturals",ViewingMinutes:3985618.77,Impact:49.00452754,Cost:654720,Spots:850,OTS:1.736,SyncReach:4.102,Impressions:7279.99,GRP:36.93},
  {Region:"HSM",Channel:"anmol tv",Genre:"Hindi GEC FTA",Language:"multi",Brand:"garnier black naturals",ViewingMinutes:7028400.29,Impact:16.08889686,Cost:384105,Spots:100,OTS:2.228,SyncReach:2.016,Impressions:2296.33,GRP:13.84},
  {Region:"HSM",Channel:"anmol tv",Genre:"Hindi GEC FTA",Language:"multi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7028400.29,Impact:291.1017,Cost:10533600,Spots:1320,OTS:8.6,SyncReach:4.014,Impressions:29685.26,GRP:176.73},
  {Region:"HSM",Channel:"b4u kadak",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:6026096.39,Impact:178.8036544,Cost:1733062.5,Spots:1080,OTS:2.094,SyncReach:6.538,Impressions:16052.72,GRP:84.88},
  {Region:"HSM",Channel:"b4u kadak",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6026096.39,Impact:216.3573,Cost:382030,Spots:755,OTS:2.204,SyncReach:5.445,Impressions:12095.13,GRP:67.58},
  {Region:"HSM",Channel:"b4u movies",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:6710565.98,Impact:249.3401686,Cost:1778560,Spots:995,OTS:2.302,SyncReach:7.314,Impressions:19682.43,GRP:102.35},
  {Region:"HSM",Channel:"b4u movies",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6710565.98,Impact:50.9072,Cost:102270,Spots:105,OTS:1.6,SyncReach:1.996,Impressions:2836.07,GRP:13.95},
  {Region:"HSM",Channel:"b4u music",Genre:"Hindi Music FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7296912.01,Impact:12.8252,Cost:78780,Spots:65,OTS:1.368,SyncReach:1.548,Impressions:726.39,GRP:3.55},
  {Region:"HSM",Channel:"big magic",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:2135295.72,Impact:76.71762795,Cost:797720,Spots:1350,OTS:5.532,SyncReach:2.357,Impressions:9813.52,GRP:57.42},
  {Region:"HSM",Channel:"big magic",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2135295.72,Impact:66.3485,Cost:1852500,Spots:975,OTS:2.504,SyncReach:2.811,Impressions:5308.99,GRP:29.41},
  {Region:"HSM",Channel:"colors",Genre:"Hindi GEC 1",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:46139497.66,Impact:767.7177831,Cost:28093750,Spots:1015,OTS:7.04,SyncReach:15.964,Impressions:111218.15,GRP:614.91},
  {Region:"HSM",Channel:"colors",Genre:"Hindi GEC 1",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:46139497.66,Impact:245.1882,Cost:10966800,Spots:190,OTS:2.996,SyncReach:8.096,Impressions:24731.57,GRP:133.59},
  {Region:"HSM",Channel:"colors cineplex bollywood",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:10855341.22,Impact:206.187,Cost:609000,Spots:525,OTS:1.998,SyncReach:5.52,Impressions:11990.07,GRP:61.11},
  {Region:"HSM",Channel:"colors cineplex superhits",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:9996055.11,Impact:169.2425,Cost:3655180,Spots:895,OTS:2.22,SyncReach:7.087,Impressions:18466.61,GRP:91.9},
  {Region:"HSM",Channel:"colors hd",Genre:"Hindi GEC HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:5134286.88,Impact:32.91289545,Cost:647915,Spots:265,OTS:4.62,SyncReach:1.773,Impressions:4260.44,GRP:26.28},
  {Region:"HSM",Channel:"colors rishtey",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:10317868.73,Impact:388.2829392,Cost:7630630,Spots:2080,OTS:7.288,SyncReach:7.826,Impressions:54552.14,GRP:308.04},
  {Region:"HSM",Channel:"colors rishtey",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:10317868.73,Impact:216.8968,Cost:9643200,Spots:980,OTS:4.578,SyncReach:4.904,Impressions:20679.46,GRP:114.01},
  {Region:"HSM",Channel:"dangal",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:16416433.06,Impact:294.3112541,Cost:8525492.5,Spots:1030,OTS:7.306,SyncReach:7.065,Impressions:45772.03,GRP:256.56},
  {Region:"HSM",Channel:"dangal",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:16416433.06,Impact:569.1034,Cost:21009900,Spots:1475,OTS:8.662,SyncReach:7.676,Impressions:62225.67,GRP:338.6},
  {Region:"HSM",Channel:"dangal 2",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5472235.18,Impact:130.4789,Cost:2548630,Spots:805,OTS:3.758,SyncReach:3.969,Impressions:11546.84,GRP:67.17},
  {Region:"HSM",Channel:"goldmines",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:20235313.78,Impact:549.2347649,Cost:7416890,Spots:1310,OTS:3.206,SyncReach:12.205,Impressions:51273.71,GRP:242.48},
  {Region:"HSM",Channel:"goldmines",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:20235313.78,Impact:349.9441,Cost:2519400,Spots:650,OTS:2.214,SyncReach:7.796,Impressions:22315.47,GRP:108.06},
  {Region:"HSM",Channel:"goldmines bollywood",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:7985551.37,Impact:512.8014079,Cost:2427640,Spots:2280,OTS:3.952,SyncReach:10.26,Impressions:44471.07,GRP:233.92},
  {Region:"HSM",Channel:"goldmines movies",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:6184109.13,Impact:446.664888,Cost:2247360,Spots:2930,OTS:4.526,SyncReach:9.281,Impressions:43384.03,GRP:229.62},
  {Region:"HSM",Channel:"good news today",Genre:"Hindi News FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1976583.79,Impact:49.3753,Cost:210990,Spots:195,OTS:1.848,SyncReach:1.659,Impressions:1722.26,GRP:10.09},
  {Region:"HSM",Channel:"ishara tv",Genre:"Hindi GEC FTA",Language:"multi",Brand:"garnier black naturals",ViewingMinutes:695033.13,Impact:10.97261305,Cost:446250,Spots:930,OTS:5.382,SyncReach:1.113,Impressions:1404.65,GRP:7.53},
  {Region:"HSM",Channel:"manoranjan tv",Genre:"Hindi GEC FTA",Language:"multi",Brand:"garnier black naturals",ViewingMinutes:6553814.13,Impact:80.46568635,Cost:1089900,Spots:495,OTS:3.724,SyncReach:3.199,Impressions:11118.24,GRP:58.94},
  {Region:"HSM",Channel:"manoranjan tv",Genre:"Hindi GEC FTA",Language:"multi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6553814.13,Impact:68.9085,Cost:549780,Spots:355,OTS:2.218,SyncReach:2.919,Impressions:6128.58,GRP:31.4},
  {Region:"HSM",Channel:"movies ok",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:8103645.5,Impact:205.9693645,Cost:2887475,Spots:860,OTS:2.22,SyncReach:5.864,Impressions:15658.89,GRP:80.28},
  {Region:"HSM",Channel:"movies ok",Genre:"Hindi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:8103645.5,Impact:47.1135,Cost:411180,Spots:175,OTS:1.384,SyncReach:3.176,Impressions:4212.23,GRP:21.05},
  {Region:"HSM",Channel:"nazara tv",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:959078.78,Impact:1.56261687,Cost:32890,Spots:55,OTS:1.13,SyncReach:0.744,Impressions:226.57,GRP:1.19},
  {Region:"HSM",Channel:"nazara tv",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:959078.78,Impact:4.398,Cost:70224,Spots:132,OTS:1.466,SyncReach:0.757,Impressions:365.8,GRP:1.93},
  {Region:"HSM",Channel:"news18 india",Genre:"Hindi News",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:10437298.44,Impact:168.3604728,Cost:2571210,Spots:745,OTS:3.094,SyncReach:6.168,Impressions:18348.13,GRP:91.23},
  {Region:"HSM",Channel:"news18 india",Genre:"Hindi News",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:10437298.44,Impact:15.7497,Cost:184960,Spots:70,OTS:1.644,SyncReach:1.533,Impressions:1343.35,GRP:6.69},
  {Region:"HSM",Channel:"sahara one",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:3065001.08,Impact:57.76048626,Cost:659790,Spots:740,OTS:1.982,SyncReach:3.106,Impressions:5912.49,GRP:30.78},
  {Region:"HSM",Channel:"sahara one",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3065001.08,Impact:151.4028,Cost:2497360,Spots:950,OTS:3.464,SyncReach:3.855,Impressions:12779.09,GRP:71.79},
  {Region:"HSM",Channel:"set hd",Genre:"Hindi GEC HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:5199430.05,Impact:44.65749001,Cost:750750,Spots:300,OTS:8.394,SyncReach:1.461,Impressions:5236.34,GRP:33.02},
  {Region:"HSM",Channel:"shemaroo tv",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:6820740.45,Impact:210.0779377,Cost:1940430,Spots:755,OTS:1.938,SyncReach:5.881,Impressions:10919.45,GRP:55.21},
  {Region:"HSM",Channel:"shemaroo tv",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6820740.45,Impact:37.2626,Cost:100170,Spots:185,OTS:1.494,SyncReach:2.219,Impressions:3174.66,GRP:15.66},
  {Region:"HSM",Channel:"shemaroo umang",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2917814.37,Impact:15.375,Cost:63800,Spots:110,OTS:1.262,SyncReach:1.533,Impressions:960.04,GRP:4.76},
  {Region:"HSM",Channel:"sony",Genre:"Hindi GEC 1",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:25649508.63,Impact:421.5908704,Cost:19737562.5,Spots:890,OTS:7.004,SyncReach:9.831,Impressions:66242.48,GRP:366.98},
  {Region:"HSM",Channel:"sony",Genre:"Hindi GEC 1",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:25649508.63,Impact:50.2685,Cost:1994370,Spots:105,OTS:3.088,SyncReach:2.847,Impressions:8436.72,GRP:45.23},
  {Region:"HSM",Channel:"sony max 2",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:7389936.21,Impact:261.9398303,Cost:4018560,Spots:1175,OTS:3.138,SyncReach:6.413,Impressions:19342.49,GRP:102.89},
  {Region:"HSM",Channel:"sony max 2",Genre:"Hindi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7389936.21,Impact:109.4779,Cost:1206720,Spots:380,OTS:3.088,SyncReach:3.555,Impressions:10528.94,GRP:54.9},
  {Region:"HSM",Channel:"sony max hd",Genre:"Hindi Movies HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:3538631.21,Impact:25.48605428,Cost:421140,Spots:180,OTS:6.424,SyncReach:1.178,Impressions:3235.13,GRP:21.19},
  {Region:"HSM",Channel:"sony pal",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:13456866.14,Impact:427.8680411,Cost:8447670,Spots:2165,OTS:5.766,SyncReach:8.932,Impressions:49446.6,GRP:277.01},
  {Region:"HSM",Channel:"sony pal",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:13456866.14,Impact:221.4217,Cost:4073600,Spots:1200,OTS:2.922,SyncReach:6.017,Impressions:16854.15,GRP:93.67},
  {Region:"HSM",Channel:"sony sab",Genre:"Hindi GEC 2",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:24298773.51,Impact:540.8654478,Cost:14892480,Spots:1325,OTS:5.998,SyncReach:12.035,Impressions:69361.25,GRP:387.59},
  {Region:"HSM",Channel:"sony sab",Genre:"Hindi GEC 2",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:24298773.51,Impact:108.9538,Cost:2519400,Spots:210,OTS:2.71,SyncReach:4.67,Impressions:12121.65,GRP:66.06},
  {Region:"HSM",Channel:"sony wah",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:12652682.5,Impact:436.5988667,Cost:4995900,Spots:1595,OTS:3.176,SyncReach:9.197,Impressions:28043.32,GRP:145.74},
  {Region:"HSM",Channel:"sony wah",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:12652682.5,Impact:128.5398,Cost:906180,Spots:495,OTS:2.052,SyncReach:4.601,Impressions:9063.57,GRP:46.99},
  {Region:"HSM",Channel:"star bharat",Genre:"Hindi GEC 2",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:8166766.11,Impact:214.9706878,Cost:4875420,Spots:960,OTS:5.246,SyncReach:5.508,Impressions:27760.83,GRP:155.05},
  {Region:"HSM",Channel:"star bharat",Genre:"Hindi GEC 2",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:8166766.11,Impact:16.5555,Cost:275600,Spots:50,OTS:1.546,SyncReach:1.711,Impressions:1265.07,GRP:6.51},
  {Region:"HSM",Channel:"star gold",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:15893296.49,Impact:380.530566,Cost:7605850,Spots:755,OTS:4.388,SyncReach:8.759,Impressions:36930.12,GRP:196.73},
  {Region:"HSM",Channel:"star gold",Genre:"Hindi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:15893296.49,Impact:167.1818,Cost:3030440,Spots:275,OTS:3.16,SyncReach:5.215,Impressions:15826.37,GRP:84.25},
  {Region:"HSM",Channel:"star gold 2",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:8296952.16,Impact:301.1093626,Cost:4313100,Spots:1340,OTS:2.99,SyncReach:7.251,Impressions:20802.88,GRP:108.97},
  {Region:"HSM",Channel:"star gold 2",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:8296952.16,Impact:89.1665,Cost:835320,Spots:400,OTS:1.806,SyncReach:3.833,Impressions:6636.35,GRP:34.26},
  {Region:"HSM",Channel:"star gold hd",Genre:"Hindi Movies HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:1631628.38,Impact:20.76633266,Cost:265580,Spots:135,OTS:5.842,SyncReach:1.114,Impressions:2783.95,GRP:18.03},
  {Region:"HSM",Channel:"star plus",Genre:"Hindi GEC 1",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:41188851.54,Impact:628.3098426,Cost:29299375,Spots:705,OTS:10.318,SyncReach:12.485,Impressions:123692.03,GRP:691.06},
  {Region:"HSM",Channel:"star plus",Genre:"Hindi GEC 1",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:41188851.54,Impact:83.5206,Cost:4042500,Spots:65,OTS:3.318,SyncReach:3.769,Impressions:11993.29,GRP:64.66},
  {Region:"HSM",Channel:"star plus hd",Genre:"Hindi GEC HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:5476099.06,Impact:42.57422044,Cost:632800,Spots:190,OTS:7.386,SyncReach:1.445,Impressions:5131.57,GRP:32.99},
  {Region:"HSM",Channel:"star utsav",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:7295422.74,Impact:283.8009629,Cost:5252100,Spots:2285,OTS:4.752,SyncReach:6.906,Impressions:31498.25,GRP:175.35},
  {Region:"HSM",Channel:"star utsav",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7295422.74,Impact:116.7419,Cost:1852500,Spots:975,OTS:2.348,SyncReach:4.458,Impressions:10034.38,GRP:55.57},
  {Region:"HSM",Channel:"star utsav movies",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:7166867.39,Impact:285.5680259,Cost:4056975,Spots:1515,OTS:2.69,SyncReach:7.131,Impressions:18404.37,GRP:96.36},
  {Region:"HSM",Channel:"star utsav movies",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:7166867.39,Impact:114.9234,Cost:992250,Spots:610,OTS:1.79,SyncReach:4.403,Impressions:7534.82,GRP:39.25},
  {Region:"HSM",Channel:"zee anmol",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:20143668.75,Impact:499.9430093,Cost:7915850,Spots:2485,OTS:3.764,SyncReach:11.111,Impressions:40130.98,GRP:212.74},
  {Region:"HSM",Channel:"zee anmol",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:20143668.75,Impact:370.486,Cost:6176300,Spots:1630,OTS:3.294,SyncReach:9.019,Impressions:28486.79,GRP:155.23},
  {Region:"HSM",Channel:"zee anmol cinema",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:14671606.95,Impact:473.1636609,Cost:5166525,Spots:2415,OTS:2.876,SyncReach:10.388,Impressions:28662.51,GRP:151.03},
  {Region:"HSM",Channel:"zee anmol cinema",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:14671606.95,Impact:248.4167,Cost:1734200,Spots:1205,OTS:2.192,SyncReach:7.019,Impressions:14727.03,GRP:77.07},
  {Region:"HSM",Channel:"zee bollywood",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:5905695.52,Impact:181.2037003,Cost:1628670,Spots:1400,OTS:2.066,SyncReach:5.661,Impressions:11212.3,GRP:59.07},
  {Region:"HSM",Channel:"zee bollywood",Genre:"Hindi Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5905695.52,Impact:94.5766,Cost:533780,Spots:730,OTS:1.54,SyncReach:3.878,Impressions:5728.72,GRP:29.51},
  {Region:"HSM",Channel:"zee cinema",Genre:"Hindi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:15614918.83,Impact:290.1155917,Cost:5685000,Spots:645,OTS:3.362,SyncReach:7.527,Impressions:24300.78,GRP:127.18},
  {Region:"HSM",Channel:"zee cinema",Genre:"Hindi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:15614918.83,Impact:99.9661,Cost:1432200,Spots:180,OTS:2.232,SyncReach:4.175,Impressions:8949.6,GRP:46.29},
  {Region:"HSM",Channel:"zee cinema hd",Genre:"Hindi Movies HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:2168814.22,Impact:28.60082766,Cost:501600,Spots:240,OTS:6.586,SyncReach:1.287,Impressions:3625.05,GRP:23.68},
  {Region:"HSM",Channel:"zee ganga",Genre:"Hindi GEC FTA",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:1116878.91,Impact:4.632891584,Cost:93940,Spots:100,OTS:1.358,SyncReach:1.124,Impressions:652.46,GRP:3.42},
  {Region:"HSM",Channel:"zee tv",Genre:"Hindi GEC 1",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:25792403.25,Impact:413.5088009,Cost:17227000,Spots:625,OTS:10.15,SyncReach:8.627,Impressions:84081.67,GRP:468.28},
  {Region:"HSM",Channel:"zee tv",Genre:"Hindi GEC 1",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:25792403.25,Impact:38.7028,Cost:1463000,Spots:50,OTS:2.584,SyncReach:2.41,Impressions:5969.62,GRP:31.77},
  {Region:"HSM",Channel:"zee tv hd",Genre:"Hindi GEC HD",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:2804380.94,Impact:25.40009065,Cost:437775,Spots:165,OTS:6.424,SyncReach:1.179,Impressions:3238.09,GRP:21.1},
  {Region:"KAR",Channel:"colors kannada",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:6980976.81,Impact:13.6481,Cost:142884,Spots:21,OTS:1.68,SyncReach:6.925,Impressions:1210.75,GRP:14.99},
  {Region:"KAR",Channel:"colors kannada cinema",Genre:"Kannada Movies",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1748535.81,Impact:23.6775,Cost:73920,Spots:80,OTS:1.87,SyncReach:7.36,Impressions:1325.24,GRP:16.41},
  {Region:"KAR",Channel:"colors kannada hd",Genre:"Kannada GEC HD",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:1274376.29,Impact:18.63092225,Cost:0,Spots:179,OTS:7.75,SyncReach:4.235,Impressions:2681.28,GRP:33.2},
  {Region:"KAR",Channel:"colors kannada hd",Genre:"Kannada GEC HD",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1274376.29,Impact:2.9809,Cost:19140,Spots:30,OTS:1.64,SyncReach:2.185,Impressions:265.51,GRP:3.29},
  {Region:"KAR",Channel:"colors super",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:721548.09,Impact:9.1177,Cost:82688,Spots:76,OTS:1.99,SyncReach:4.96,Impressions:717.31,GRP:8.88},
  {Region:"KAR",Channel:"public music",Genre:"Kannada Music",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:1037337.45,Impact:127.4643336,Cost:216405,Spots:458,OTS:5.95,SyncReach:18.72,Impressions:9797.54,GRP:121.34},
  {Region:"KAR",Channel:"sirikannada all time",Genre:"Kannada Movies FTA",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:1550947.42,Impact:72.09455159,Cost:249679.5,Spots:198,OTS:10.99,SyncReach:12.09,Impressions:10786.43,GRP:133.59},
  {Region:"KAR",Channel:"star suvarna",Genre:"Kannada GEC",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:9446128.97,Impact:66.92752392,Cost:299981.5,Spots:77,OTS:5.18,SyncReach:20.545,Impressions:9506.85,GRP:117.75},
  {Region:"KAR",Channel:"star suvarna",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:9446128.97,Impact:34.0044,Cost:122352,Spots:24,OTS:4.56,SyncReach:7.99,Impressions:3353.54,GRP:41.53},
  {Region:"KAR",Channel:"star suvarna plus",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2444254.15,Impact:80.2654,Cost:67782,Spots:143,OTS:3.07,SyncReach:15.705,Impressions:4671.25,GRP:57.86},
  {Region:"KAR",Channel:"udaya comedy",Genre:"Kannada Comedy",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:931926.33,Impact:80.8027,Cost:202124,Spots:338,OTS:2.78,SyncReach:13.41,Impressions:3850.26,GRP:47.68},
  {Region:"KAR",Channel:"udaya movies",Genre:"Kannada Movies",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3547377.63,Impact:90.4042,Cost:236042,Spots:107,OTS:3.04,SyncReach:17.755,Impressions:5251.68,GRP:65.03},
  {Region:"KAR",Channel:"udaya music",Genre:"Kannada Music",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:1596186.9,Impact:75.98543135,Cost:197456,Spots:291,OTS:4.18,SyncReach:16.72,Impressions:6818.39,GRP:84.44},
  {Region:"KAR",Channel:"udaya music",Genre:"Kannada Music",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1596186.9,Impact:47.8903,Cost:127310,Spots:145,OTS:2.4,SyncReach:11.14,Impressions:2496.42,GRP:30.93},
  {Region:"KAR",Channel:"udaya tv",Genre:"Kannada GEC",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:3740286.81,Impact:19.65881105,Cost:194512.5,Spots:54,OTS:1.99,SyncReach:14.32,Impressions:2740.09,GRP:33.93},
  {Region:"KAR",Channel:"udaya tv",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3740286.81,Impact:211.5117,Cost:1134440,Spots:359,OTS:7.55,SyncReach:30.525,Impressions:20041.67,GRP:248.2},
  {Region:"KAR",Channel:"udaya tv hd",Genre:"Kannada GEC HD",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:461155.21,Impact:2.802,Cost:2210,Spots:17,OTS:3.36,SyncReach:2.52,Impressions:257.47,GRP:3.19},
  {Region:"KAR",Channel:"zee kannada",Genre:"Kannada GEC",Language:"kannada",Brand:"garnier black naturals",ViewingMinutes:14471360.45,Impact:126.2606264,Cost:1076763,Spots:108,OTS:6.39,SyncReach:29.98,Impressions:17454.02,GRP:216.15},
  {Region:"KAR",Channel:"zee kannada",Genre:"Kannada GEC",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:14471360.45,Impact:223.327,Cost:1214752,Spots:136,OTS:7.71,SyncReach:31.925,Impressions:20797.25,GRP:257.55},
  {Region:"KAR",Channel:"zee kannada hd",Genre:"Kannada GEC HD",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2496230.78,Impact:40.4449,Cost:123216,Spots:136,OTS:10.59,SyncReach:6.28,Impressions:4224.49,GRP:52.31},
  {Region:"KAR",Channel:"zee picchar",Genre:"Kannada Movies",Language:"kannada",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1781455.17,Impact:95.6689,Cost:191840,Spots:220,OTS:3.03,SyncReach:18.695,Impressions:5078.84,GRP:62.89},
  {Region:"MAH",Channel:"9x jhakaas",Genre:"Marathi Music",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:221402.45,Impact:27.26922624,Cost:0,Spots:642,OTS:5.67,SyncReach:2.795,Impressions:2161.63,GRP:13.15},
  {Region:"MAH",Channel:"9x jhakaas",Genre:"Marathi Music",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:221402.45,Impact:42.288,Cost:201654,Spots:659,OTS:4.95,SyncReach:3.72,Impressions:2016.41,GRP:12.27},
  {Region:"MAH",Channel:"colors marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:2405824.03,Impact:94.56701107,Cost:520194,Spots:316,OTS:6.66,SyncReach:8.82,Impressions:10242.05,GRP:62.31},
  {Region:"MAH",Channel:"colors marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2405824.03,Impact:8.9903,Cost:95480,Spots:31,OTS:1.99,SyncReach:3.575,Impressions:792.01,GRP:4.82},
  {Region:"MAH",Channel:"fakt marathi",Genre:"Marathi Movies FTA",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:831154.66,Impact:12.6212,Cost:80964,Spots:78,OTS:2.42,SyncReach:3.045,Impressions:910.31,GRP:5.54},
  {Region:"MAH",Channel:"maiboli",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:190383.64,Impact:14.45906862,Cost:1088622,Spots:613,OTS:3.98,SyncReach:2.61,Impressions:2008.15,GRP:12.22},
  {Region:"MAH",Channel:"maiboli",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:190383.64,Impact:12.678,Cost:181152,Spots:444,OTS:2.81,SyncReach:2.775,Impressions:1203.39,GRP:7.32},
  {Region:"MAH",Channel:"pravah picture",Genre:"Marathi Movies",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1298748.33,Impact:69.4571,Cost:971776,Spots:256,OTS:3.02,SyncReach:6.695,Impressions:3624.96,GRP:22.05},
  {Region:"MAH",Channel:"shemaroo marathibana",Genre:"Marathi Movies FTA",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1449910.64,Impact:137.7423,Cost:87000,Spots:300,OTS:5.19,SyncReach:7.76,Impressions:6627.98,GRP:40.32},
  {Region:"MAH",Channel:"sony marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:2304585.69,Impact:119.0159501,Cost:640035,Spots:575,OTS:7.31,SyncReach:11.59,Impressions:15465.52,GRP:94.09},
  {Region:"MAH",Channel:"sony marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2304585.69,Impact:69.5185,Cost:291046.2,Spots:286,OTS:4.39,SyncReach:8.35,Impressions:5986.24,GRP:36.42},
  {Region:"MAH",Channel:"star pravah",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:19726775.49,Impact:773.6645606,Cost:3646566,Spots:412,OTS:23.9,SyncReach:25.825,Impressions:101932.8,GRP:620.14},
  {Region:"MAH",Channel:"star pravah",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:19726775.49,Impact:614.1134,Cost:2596290,Spots:185,OTS:13.36,SyncReach:23.645,Impressions:54319.56,GRP:330.47},
  {Region:"MAH",Channel:"star pravah hd",Genre:"Marathi GEC HD",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1201024.84,Impact:36.98,Cost:104304,Spots:246,OTS:12.06,SyncReach:2.24,Impressions:3231.68,GRP:19.66},
  {Region:"MAH",Channel:"zee 24 taas",Genre:"Marathi News",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:555099.65,Impact:7.2948,Cost:28116,Spots:33,OTS:1.33,SyncReach:1.635,Impressions:367.92,GRP:2.24},
  {Region:"MAH",Channel:"zee chitramandir",Genre:"Marathi Movies FTA",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:476151.01,Impact:45.0585,Cost:509796,Spots:441,OTS:10.71,SyncReach:1.71,Impressions:2945.59,GRP:17.92},
  {Region:"MAH",Channel:"zee marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:11553035.84,Impact:273.3991351,Cost:905925,Spots:161,OTS:14.4,SyncReach:15.245,Impressions:38003.33,GRP:231.21},
  {Region:"MAH",Channel:"zee marathi",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:11553035.84,Impact:214.2473,Cost:1849056,Spots:187,OTS:7.68,SyncReach:14.44,Impressions:19692.5,GRP:119.81},
  {Region:"MAH",Channel:"zee marathi hd",Genre:"Marathi GEC HD",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:1277984.57,Impact:24.60699759,Cost:0,Spots:164,OTS:13.94,SyncReach:2.31,Impressions:3748.16,GRP:22.8},
  {Region:"MAH",Channel:"zee marathi hd",Genre:"Marathi GEC HD",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1277984.57,Impact:2.9693,Cost:155856,Spots:34,OTS:3.09,SyncReach:1.565,Impressions:293.43,GRP:1.79},
  {Region:"MAH",Channel:"zee talkies",Genre:"Marathi Movies",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:2741169.57,Impact:16.93370378,Cost:37814,Spots:33,OTS:1.81,SyncReach:4.37,Impressions:1327.97,GRP:8.08},
  {Region:"MAH",Channel:"zee talkies",Genre:"Marathi Movies",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2741169.57,Impact:158.2307,Cost:592288,Spots:223,OTS:3.7,SyncReach:10.64,Impressions:7632.63,GRP:46.44},
  {Region:"MAH",Channel:"zee talkies hd",Genre:"Marathi Movies HD",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:207949.47,Impact:1.683533006,Cost:0,Spots:59,OTS:1.94,SyncReach:0.49,Impressions:166.46,GRP:1.01},
  {Region:"MAH",Channel:"zee talkies hd",Genre:"Marathi Movies HD",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:207949.47,Impact:3.0297,Cost:44080,Spots:38,OTS:3.78,SyncReach:1.455,Impressions:238.9,GRP:1.45},
  {Region:"MAH",Channel:"zee yuva",Genre:"Marathi GEC",Language:"marathi",Brand:"garnier black naturals",ViewingMinutes:1102281.63,Impact:3.419263978,Cost:62250,Spots:67,OTS:1.43,SyncReach:3.02,Impressions:460.37,GRP:2.8},
  {Region:"MAH",Channel:"zee yuva",Genre:"Marathi GEC",Language:"marathi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1102281.63,Impact:49.9155,Cost:395352,Spots:323,OTS:2.98,SyncReach:8.81,Impressions:4587.09,GRP:27.91},
  {Region:"Orissa",Channel:"prarthana life",Genre:"Odisha Spiritual",Language:"multi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:172750.03,Impact:10.9828,Cost:113568,Spots:273,OTS:4.66,SyncReach:8.59,Impressions:788.92,GRP:41.47},
  {Region:"Orissa",Channel:"siddharth gold",Genre:"Odia GEC",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:216899.61,Impact:16.5258,Cost:104146,Spots:301,OTS:4.33,SyncReach:11.38,Impressions:1060.08,GRP:55.71},
  {Region:"Orissa",Channel:"siddharth tv",Genre:"Odia GEC",Language:"odia",Brand:"godrej expert rich creme hair colour",ViewingMinutes:712734.46,Impact:8.2682,Cost:17690,Spots:61,OTS:3.15,SyncReach:11.69,Impressions:787.14,GRP:41.37},
  {Region:"Orissa",Channel:"sidharth utsav",Genre:"Odisha Spiritual",Language:"multi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:349625.51,Impact:2.7946,Cost:6800,Spots:20,OTS:2.08,SyncReach:5.265,Impressions:176.26,GRP:9.27},
  {Region:"Orissa",Channel:"tarang",Genre:"Odia GEC",Language:"odia",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1310225.1,Impact:28.8592,Cost:235420,Spots:158,OTS:4.6,SyncReach:22.85,Impressions:2339.27,GRP:122.9},
  {Region:"Orissa",Channel:"tarang music",Genre:"Odia Music",Language:"odia",Brand:"godrej expert rich creme hair colour",ViewingMinutes:132941.09,Impact:8.1044,Cost:17324,Spots:122,OTS:2.69,SyncReach:4.995,Impressions:314.59,GRP:16.53},
  {Region:"Orissa",Channel:"zee sarthak",Genre:"Odia GEC",Language:"odia",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1872236.6,Impact:19.2028,Cost:130680,Spots:90,OTS:4.89,SyncReach:19.49,Impressions:1870.94,GRP:98.31},
  {Region:"Punjab",Channel:"9x tashan",Genre:"Punjabi Music",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:122826.37,Impact:8.247944954,Cost:0,Spots:408,OTS:2.21,SyncReach:3.9825,Impressions:548.6,GRP:16.19},
  {Region:"Punjab",Channel:"9x tashan",Genre:"Punjabi Music",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:122826.37,Impact:27.7779,Cost:683100,Spots:1150,OTS:3.635,SyncReach:4.22,Impressions:1297.26,GRP:38.8},
  {Region:"Punjab",Channel:"chardikla time tv",Genre:"Punjabi GEC FTA",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:76404.44,Impact:16.1148,Cost:181376,Spots:416,OTS:4.89,SyncReach:2.235,Impressions:558.74,GRP:16.73},
  {Region:"Punjab",Channel:"living india news",Genre:"Punjabi News",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:71892.66,Impact:8.1517,Cost:106384,Spots:244,OTS:3.51,SyncReach:2.58,Impressions:385.33,GRP:11.38},
  {Region:"Punjab",Channel:"manoranjan movies",Genre:"Punjabi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:100559.78,Impact:6.845654766,Cost:420000,Spots:454,OTS:1.615,SyncReach:3.6025,Impressions:487.75,GRP:14.58},
  {Region:"Punjab",Channel:"mh one",Genre:"Punjabi Movies",Language:"hindi",Brand:"garnier black naturals",ViewingMinutes:422678.47,Impact:8.078415677,Cost:0,Spots:294,OTS:3.245,SyncReach:3.8625,Impressions:937.69,GRP:28.87},
  {Region:"Punjab",Channel:"mh one",Genre:"Punjabi Movies",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:422678.47,Impact:27.8607,Cost:292320,Spots:580,OTS:4.505,SyncReach:6.1425,Impressions:2257.41,GRP:67.96},
  {Region:"Punjab",Channel:"mh one news",Genre:"Punjabi News",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:486153.78,Impact:1.2239,Cost:6740,Spots:10,OTS:1.055,SyncReach:1.5975,Impressions:75.23,GRP:2.16},
  {Region:"Punjab",Channel:"pitaara tv",Genre:"Punjabi Movies",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:1196189.29,Impact:35.85479141,Cost:996132,Spots:430,OTS:6.45,SyncReach:13.1975,Impressions:5015.29,GRP:156},
  {Region:"Punjab",Channel:"pitaara tv",Genre:"Punjabi Movies",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1196189.29,Impact:18.7283,Cost:41760,Spots:180,OTS:2.735,SyncReach:7.615,Impressions:1599.32,GRP:48.24},
  {Region:"Punjab",Channel:"ptc music",Genre:"Punjabi Music",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:132749.64,Impact:4.111896285,Cost:0,Spots:214,OTS:2.285,SyncReach:3.295,Impressions:375.18,GRP:12.14},
  {Region:"Punjab",Channel:"ptc music",Genre:"Punjabi Music",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:132749.64,Impact:7.2228,Cost:186840,Spots:540,OTS:2.585,SyncReach:3.14,Impressions:443.88,GRP:13.8},
  {Region:"Punjab",Channel:"ptc punjabi",Genre:"Punjabi GEC",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:693904.04,Impact:19.30473772,Cost:560070,Spots:1180,OTS:5.275,SyncReach:7.9275,Impressions:2509.85,GRP:76.64},
  {Region:"Punjab",Channel:"ptc punjabi",Genre:"Punjabi GEC",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:693904.04,Impact:15.2188,Cost:1784820,Spots:906,OTS:3.41,SyncReach:7.33,Impressions:1466.09,GRP:44.16},
  {Region:"Punjab",Channel:"ptc punjabi gold",Genre:"Punjabi Movies",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:164129.92,Impact:4.099867893,Cost:77578,Spots:220,OTS:1.575,SyncReach:3.415,Impressions:292.89,GRP:9.12},
  {Region:"Punjab",Channel:"punjabi hits",Genre:"Punjabi Music",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:339580,Impact:25.7550782,Cost:223755,Spots:944,OTS:4.475,SyncReach:5.625,Impressions:2338.83,GRP:67.63},
  {Region:"Punjab",Channel:"punjabi hits",Genre:"Punjabi Music",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:339580,Impact:43.6022,Cost:404840,Spots:1396,OTS:4.71,SyncReach:5.7825,Impressions:2936.97,GRP:85.59},
  {Region:"Punjab",Channel:"tabbar hits",Genre:"Punjabi Music",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:598289.87,Impact:31.30124002,Cost:136867,Spots:740,OTS:9.48,SyncReach:5.7625,Impressions:2703.19,GRP:92.74},
  {Region:"Punjab",Channel:"tabbar hits",Genre:"Punjabi Music",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:598289.87,Impact:39.4634,Cost:34040,Spots:370,OTS:8.86,SyncReach:4.385,Impressions:2225.07,GRP:73.57},
  {Region:"Punjab",Channel:"zee punjabi",Genre:"Punjabi GEC FTA",Language:"punjabi",Brand:"garnier black naturals",ViewingMinutes:381769.28,Impact:8.73015374,Cost:293306,Spots:348,OTS:2.595,SyncReach:5.5475,Impressions:991.83,GRP:30.13},
  {Region:"Punjab",Channel:"zee punjabi",Genre:"Punjabi GEC FTA",Language:"punjabi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:381769.28,Impact:18.5594,Cost:2345800,Spots:634,OTS:3.44,SyncReach:7.44,Impressions:1892.41,GRP:56.25},
  {Region:"TN",Channel:"adithya tv",Genre:"Tamil Comedy",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2507205.78,Impact:19.5999,Cost:50864,Spots:44,OTS:1.71,SyncReach:4.805,Impressions:1199.57,GRP:9.62},
  {Region:"TN",Channel:"chutti tv",Genre:"Tamil Kids",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1109762.57,Impact:7.1175,Cost:27768,Spots:39,OTS:2.19,SyncReach:1.605,Impressions:453.91,GRP:3.64},
  {Region:"TN",Channel:"colors tamil",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2008922.54,Impact:22.3723,Cost:89000,Spots:100,OTS:1.94,SyncReach:7.625,Impressions:2518.89,GRP:20.2},
  {Region:"TN",Channel:"j movie",Genre:"Tamil Movies",Language:"telugu",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1493903.56,Impact:84.7244,Cost:131328,Spots:228,OTS:2.9,SyncReach:12.825,Impressions:5314.65,GRP:42.62},
  {Region:"TN",Channel:"jaya max",Genre:"Tamil GEC",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:1401354.01,Impact:60.06295689,Cost:164362,Spots:310,OTS:2.43,SyncReach:14.55,Impressions:5343.03,GRP:42.85},
  {Region:"TN",Channel:"jaya max",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1401354.01,Impact:39.1002,Cost:24700,Spots:95,OTS:2.45,SyncReach:6.15,Impressions:2353.18,GRP:18.87},
  {Region:"TN",Channel:"kalaignar tv",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3915683.09,Impact:33.7941,Cost:110558,Spots:53,OTS:2.02,SyncReach:9.075,Impressions:3135.74,GRP:25.15},
  {Region:"TN",Channel:"news18 tamil nadu",Genre:"Tamil News",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:652621.54,Impact:3.6678,Cost:17748,Spots:29,OTS:1.31,SyncReach:2.105,Impressions:148.79,GRP:1.19},
  {Region:"TN",Channel:"puthiya thalaimurai",Genre:"Tamil News",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:731928.09,Impact:26.222,Cost:114144,Spots:123,OTS:1.84,SyncReach:4.44,Impressions:1373.19,GRP:11.01},
  {Region:"TN",Channel:"raj musix tamil",Genre:"Tamil Music",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:669922.19,Impact:54.81959801,Cost:105367.5,Spots:456,OTS:3.73,SyncReach:9.475,Impressions:5487.6,GRP:44.01},
  {Region:"TN",Channel:"raj tv",Genre:"Tamil GEC",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:513385.01,Impact:23.15634413,Cost:1004850,Spots:436,OTS:2.8,SyncReach:9.37,Impressions:3356.14,GRP:26.91},
  {Region:"TN",Channel:"raj tv",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:513385.01,Impact:10.3981,Cost:267488,Spots:208,OTS:2.01,SyncReach:5.015,Impressions:1129.9,GRP:9.06},
  {Region:"TN",Channel:"sirippoli",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1917072.97,Impact:1.5299,Cost:2608,Spots:4,OTS:1.08,SyncReach:1.9,Impressions:79.69,GRP:0.64},
  {Region:"TN",Channel:"star vijay",Genre:"Tamil GEC",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:24189266.55,Impact:460.5595568,Cost:3553230,Spots:226,OTS:13.41,SyncReach:39.94,Impressions:69979.31,GRP:561.17},
  {Region:"TN",Channel:"star vijay",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:24189266.55,Impact:39.8272,Cost:256620,Spots:13,OTS:2.21,SyncReach:13.005,Impressions:4140.04,GRP:33.2},
  {Region:"TN",Channel:"star vijay hd",Genre:"Tamil GEC HD",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1289079.86,Impact:8.934,Cost:49266,Spots:51,OTS:4.55,SyncReach:2.93,Impressions:992.16,GRP:7.96},
  {Region:"TN",Channel:"star vijay super",Genre:"Tamil Movies",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:5202253.18,Impact:210.4143404,Cost:923671,Spots:405,OTS:4.53,SyncReach:33.005,Impressions:20600.08,GRP:165.19},
  {Region:"TN",Channel:"star vijay super",Genre:"Tamil Movies",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:5202253.18,Impact:12.6166,Cost:4776,Spots:12,OTS:1.57,SyncReach:3.875,Impressions:741.11,GRP:5.94},
  {Region:"TN",Channel:"sun life",Genre:"Tamil Music",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:2634315.34,Impact:6.5112,Cost:6880,Spots:20,OTS:1.39,SyncReach:3.53,Impressions:579.09,GRP:4.64},
  {Region:"TN",Channel:"sun tv",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:27879771.69,Impact:40.1161,Cost:264816,Spots:9,OTS:1.9,SyncReach:11.67,Impressions:3640.88,GRP:29.2},
  {Region:"TN",Channel:"sun tv hd",Genre:"Tamil GEC HD",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3709839.18,Impact:8.4796,Cost:10944,Spots:18,OTS:2.31,SyncReach:3.28,Impressions:809.14,GRP:6.49},
  {Region:"TN",Channel:"thanthi tv",Genre:"Tamil News",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:350144.17,Impact:3.8942,Cost:22032,Spots:36,OTS:2.37,SyncReach:1.975,Impressions:197.63,GRP:1.58},
  {Region:"TN",Channel:"vasanth tv",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:406055.12,Impact:1.234,Cost:4160,Spots:20,OTS:1.37,SyncReach:1.32,Impressions:76.58,GRP:0.61},
  {Region:"TN",Channel:"vendhar tv",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:353229.15,Impact:7.2743,Cost:31232,Spots:256,OTS:2.05,SyncReach:2.4,Impressions:705.35,GRP:5.66},
  {Region:"TN",Channel:"zee tamil",Genre:"Tamil GEC",Language:"tamil",Brand:"garnier black naturals",ViewingMinutes:14733184.47,Impact:216.4981953,Cost:1519258,Spots:210,OTS:7.93,SyncReach:27.355,Impressions:30808.75,GRP:247.06},
  {Region:"TN",Channel:"zee tamil",Genre:"Tamil GEC",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:14733184.47,Impact:21.7984,Cost:168828,Spots:11,OTS:1.78,SyncReach:8.355,Impressions:2159.61,GRP:17.32},
  {Region:"TN",Channel:"zee thirai",Genre:"Tamil Movies",Language:"tamil",Brand:"godrej expert rich creme hair colour",ViewingMinutes:3075667.51,Impact:10.0443,Cost:17696,Spots:28,OTS:1.51,SyncReach:3.46,Impressions:620.11,GRP:4.97},
  {Region:"UP",Channel:"b4u bhojpuri",Genre:"Bhojpuri Movies FTA",Language:"bhojpuri",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1505198.19,Impact:58.1829,Cost:264000,Spots:264,OTS:4.095,SyncReach:7.425,Impressions:3115.81,GRP:61.45},
  {Region:"UP",Channel:"bhojpuri cinema",Genre:"Bhojpuri Movies FTA",Language:"bhojpuri",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1385342.41,Impact:4.2674,Cost:32164,Spots:22,OTS:1.275,SyncReach:1.89,Impressions:179.86,GRP:3.45},
  {Region:"UP",Channel:"manoranjan prime",Genre:"Bhojpuri GEC",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:345300.02,Impact:1.1583,Cost:59072,Spots:52,OTS:1.23,SyncReach:0.7575,Impressions:67.6,GRP:1.14},
  {Region:"UP",Channel:"oscar movies bhojpuri",Genre:"Bhojpuri Movies FTA",Language:"bhojpuri",Brand:"godrej expert rich creme hair colour",ViewingMinutes:710169.15,Impact:7.2734,Cost:26076,Spots:82,OTS:2.025,SyncReach:2.3,Impressions:298.38,GRP:7.21},
  {Region:"UP",Channel:"pasand",Genre:"Bhojpuri Movies FTA",Language:"hindi",Brand:"godrej expert rich creme hair colour",ViewingMinutes:744686.46,Impact:2.6168,Cost:5480,Spots:20,OTS:1.505,SyncReach:2.2325,Impressions:154.18,GRP:3.73},
  {Region:"UP",Channel:"zee biskope",Genre:"Bhojpuri Movies FTA",Language:"bhojpuri",Brand:"garnier black naturals",ViewingMinutes:1249580.17,Impact:0.330315056,Cost:11728,Spots:8,OTS:1.09,SyncReach:0.9825,Impressions:22.62,GRP:0.39},
  {Region:"UP",Channel:"zee biskope",Genre:"Bhojpuri Movies FTA",Language:"bhojpuri",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1249580.17,Impact:17.0538,Cost:217664,Spots:152,OTS:1.97,SyncReach:3.6225,Impressions:791.07,GRP:14.29},
  {Region:"WB",Channel:"aakash aath",Genre:"Bengali GEC",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:940964.75,Impact:31.61135319,Cost:475881,Spots:289,OTS:6,SyncReach:5.825,Impressions:3085.67,GRP:34.23},
  {Region:"WB",Channel:"aakash aath",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:940964.75,Impact:3.8325,Cost:45012,Spots:31,OTS:1.91,SyncReach:2.225,Impressions:354.72,GRP:3.94},
  {Region:"WB",Channel:"colors bangla",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:725228.29,Impact:25.045,Cost:476658,Spots:273,OTS:3.45,SyncReach:7.03,Impressions:2432.37,GRP:26.98},
  {Region:"WB",Channel:"colors bangla cinema",Genre:"Bengali Movies",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:1739563.26,Impact:62.98471944,Cost:319538.5,Spots:220,OTS:3.5,SyncReach:16.12,Impressions:5655.85,GRP:62.75},
  {Region:"WB",Channel:"colors bangla cinema",Genre:"Bengali Movies",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1739563.26,Impact:44.1918,Cost:210084,Spots:183,OTS:2.47,SyncReach:10.025,Impressions:2493.36,GRP:27.66},
  {Region:"WB",Channel:"jalsha movies",Genre:"Bengali Movies",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:1629913.04,Impact:59.25338867,Cost:326318,Spots:217,OTS:3.34,SyncReach:15.24,Impressions:5588.02,GRP:61.99},
  {Region:"WB",Channel:"jalsha movies",Genre:"Bengali Movies",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1629913.04,Impact:44.666,Cost:284596,Spots:169,OTS:2.41,SyncReach:9.385,Impressions:2582.96,GRP:28.66},
  {Region:"WB",Channel:"khushboo bangla",Genre:"Bengali Movies FTA",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:454810.34,Impact:19.10044291,Cost:256425,Spots:430,OTS:3.93,SyncReach:7.41,Impressions:2585.32,GRP:28.68},
  {Region:"WB",Channel:"r plus gold",Genre:"Bengali GEC",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:207684.08,Impact:11.3919452,Cost:62790,Spots:267,OTS:4.18,SyncReach:2.195,Impressions:929.56,GRP:10.31},
  {Region:"WB",Channel:"rongeen tv",Genre:"Kids",Language:"assamese",Brand:"godrej expert rich creme hair colour",ViewingMinutes:305033.4,Impact:27.813,Cost:107262,Spots:531,OTS:5.09,SyncReach:5.63,Impressions:2661.09,GRP:29.52},
  {Region:"WB",Channel:"sony aath",Genre:"Bengali GEC",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:1579929.43,Impact:26.70676659,Cost:215838,Spots:168,OTS:4.43,SyncReach:9.415,Impressions:4072.39,GRP:45.18},
  {Region:"WB",Channel:"sony aath",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1579929.43,Impact:60.9057,Cost:126284,Spots:241,OTS:5.95,SyncReach:10.195,Impressions:6076.08,GRP:67.41},
  {Region:"WB",Channel:"star jalsha",Genre:"Bengali GEC",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:11929794.95,Impact:199.6011588,Cost:3697380,Spots:219,OTS:10.74,SyncReach:28.415,Impressions:28597.52,GRP:317.26},
  {Region:"WB",Channel:"star jalsha",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:11929794.95,Impact:160.133,Cost:1142588,Spots:82,OTS:6.76,SyncReach:23.165,Impressions:15720.96,GRP:174.41},
  {Region:"WB",Channel:"sun bangla",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1370929.01,Impact:8.827,Cost:146160,Spots:70,OTS:2.27,SyncReach:4.21,Impressions:889.21,GRP:9.86},
  {Region:"WB",Channel:"sun bangla hd",Genre:"Bengali GEC HD",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:137996.56,Impact:1.4835,Cost:14560,Spots:70,OTS:7.4,SyncReach:0.65,Impressions:187.19,GRP:2.08},
  {Region:"WB",Channel:"zee bangla",Genre:"Bengali GEC",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:10641407.18,Impact:101.743861,Cost:2020551,Spots:113,OTS:5.8,SyncReach:24.14,Impressions:14144.57,GRP:156.92},
  {Region:"WB",Channel:"zee bangla",Genre:"Bengali GEC",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:10641407.18,Impact:115.2933,Cost:1730416,Spots:74,OTS:4.72,SyncReach:22.135,Impressions:10269.09,GRP:113.92},
  {Region:"WB",Channel:"zee bangla cinema",Genre:"Bengali Movies",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:1627199.64,Impact:62.05873553,Cost:452760,Spots:246,OTS:3.88,SyncReach:13.39,Impressions:5082.76,GRP:56.39},
  {Region:"WB",Channel:"zee bangla cinema",Genre:"Bengali Movies",Language:"bengali",Brand:"godrej expert rich creme hair colour",ViewingMinutes:1627199.64,Impact:35.5853,Cost:73776,Spots:87,OTS:2.27,SyncReach:9.015,Impressions:2015.35,GRP:22.36},
  {Region:"WB",Channel:"zee bangla hd",Genre:"Bengali GEC HD",Language:"bengali",Brand:"garnier black naturals",ViewingMinutes:683683.17,Impact:9.014051188,Cost:0,Spots:120,OTS:10.42,SyncReach:1.97,Impressions:1212.48,GRP:13.45}
];

// Configuration
const CONFIG = {
  SHORT_TAIL_REACH_PERCENTILE: 70,
  SHORT_TAIL_ADJUSTMENT_LIMIT: 0.10,
  MAX_CHANNEL_CONCENTRATION: 0.35,
  MIN_ACTIVE_CHANNELS: 5
};

// Helper functions
const formatCurrency = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// Colors
const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: '#64748b',
  light: '#f1f5f9',
  shortTail: '#0ea5e9',
  longTail: '#8b5cf6',
  increase: '#10b981',
  decrease: '#ef4444',
  dropped: '#6b7280',
  new: '#f97316'
};

const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1', '#84cc16'];

export default function TVCampaignOptimizer() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [optimizationMetric, setOptimizationMetric] = useState('reach');
  const [targetIncrease, setTargetIncrease] = useState(10);
  const [optimizedPlan, setOptimizedPlan] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState('comparison');
  const [shortTailThreshold, setShortTailThreshold] = useState(CONFIG.SHORT_TAIL_REACH_PERCENTILE);

  const regions = useMemo(() => [...new Set(rawData.map(d => d.Region))].sort(), []);

  const regionData = useMemo(() => {
    if (!selectedRegion) return { garnier: [], godrej: [], combined: [] };
    const filtered = rawData.filter(d => d.Region === selectedRegion);
    const garnier = filtered.filter(d => d.Brand.toLowerCase().includes('garnier'));
    const godrej = filtered.filter(d => d.Brand.toLowerCase().includes('godrej'));
    return { garnier, godrej, combined: filtered };
  }, [selectedRegion]);

  // Calculate score based on optimization metric
  const calculateScore = (channel, metric) => {
    switch(metric) {
      case 'reach':
        return channel.SyncReach; // Pure reach
      case 'impact_reach':
        return channel.SyncReach > 0 ? channel.Impact / channel.SyncReach : 0; // Impact per reach point
      case 'impact_cost':
        return channel.Cost > 0 ? (channel.Impact / channel.Cost) * 1000000 : 0; // Impact per million spent
      default:
        return channel.SyncReach;
    }
  };

  const analyzeChannels = useMemo(() => {
    if (!selectedRegion) return null;

    const { garnier, godrej } = regionData;
    const hasGarnierData = garnier.length > 0 && garnier.some(d => d.Cost > 0);
    
    // Use Garnier data if available, otherwise learn from Godrej
    const baseData = hasGarnierData ? garnier : godrej;
    const learningSource = hasGarnierData ? null : 'godrej';
    
    const channelsWithScores = baseData
      .filter(d => d.Cost > 0)
      .map(d => ({
        ...d,
        reachScore: d.SyncReach,
        impactReachScore: d.SyncReach > 0 ? d.Impact / d.SyncReach : 0,
        impactCostScore: d.Cost > 0 ? (d.Impact / d.Cost) * 1000000 : 0,
        costShare: 0,
        isShortTail: false
      }));

    if (channelsWithScores.length === 0) return null;

    const totalCost = channelsWithScores.reduce((sum, d) => sum + d.Cost, 0);
    
    channelsWithScores.forEach(d => {
      d.costShare = (d.Cost / totalCost) * 100;
    });

    // Classify short/long tail by reach
    const sortedByReach = [...channelsWithScores].sort((a, b) => b.SyncReach - a.SyncReach);
    let cumulativeReach = 0;
    const totalReach = sortedByReach.reduce((sum, d) => sum + d.SyncReach, 0);
    
    sortedByReach.forEach((d, idx) => {
      d.reachRank = idx + 1;
      cumulativeReach += d.SyncReach;
      d.cumulativeReachPct = (cumulativeReach / totalReach) * 100;
      d.isShortTail = d.cumulativeReachPct <= shortTailThreshold;
    });

    const channelMap = new Map(sortedByReach.map(d => [d.Channel, d]));
    channelsWithScores.forEach(d => {
      const classified = channelMap.get(d.Channel);
      if (classified) {
        d.isShortTail = classified.isShortTail;
        d.reachRank = classified.reachRank;
        d.cumulativeReachPct = classified.cumulativeReachPct;
      }
    });

    const totalImpact = channelsWithScores.reduce((sum, d) => sum + d.Impact, 0);
    const totalGRP = channelsWithScores.reduce((sum, d) => sum + d.GRP, 0);

    // Get Godrej channels for competition learning
    const godrejChannels = godrej.filter(d => d.Cost > 0).map(d => ({
      ...d,
      reachScore: d.SyncReach,
      impactReachScore: d.SyncReach > 0 ? d.Impact / d.SyncReach : 0,
      impactCostScore: d.Cost > 0 ? (d.Impact / d.Cost) * 1000000 : 0
    }));

    return {
      channels: channelsWithScores,
      godrejChannels,
      totalCost,
      totalImpact,
      totalReach,
      totalGRP,
      hasGarnierData,
      learningSource,
      shortTailCount: channelsWithScores.filter(d => d.isShortTail).length,
      longTailCount: channelsWithScores.filter(d => !d.isShortTail).length
    };
  }, [selectedRegion, regionData, shortTailThreshold]);

  // Optimization algorithm
  const runOptimization = () => {
    if (!analyzeChannels) return;

    setIsOptimizing(true);

    setTimeout(() => {
      const { channels, godrejChannels, totalCost, totalImpact, totalReach, learningSource } = analyzeChannels;
      
      // Clone channels for optimization
      let optimizedChannels = channels.map(c => ({
        ...c,
        originalCost: c.Cost,
        originalCostShare: c.costShare,
        newCost: c.Cost,
        newCostShare: c.costShare,
        change: 0,
        changePercent: 0,
        tag: 'UNCHANGED',
        currentScore: calculateScore(c, optimizationMetric)
      }));

      // Competition learning: Add high-scoring Godrej channels not in current plan
      const existingChannelNames = new Set(optimizedChannels.map(c => c.Channel));
      const potentialNewChannels = godrejChannels
        .filter(d => !existingChannelNames.has(d.Channel))
        .map(d => ({
          ...d,
          currentScore: calculateScore(d, optimizationMetric),
          originalCost: 0,
          originalCostShare: 0,
          newCost: 0,
          newCostShare: 0,
          change: 0,
          changePercent: 0,
          isShortTail: d.SyncReach > 5,
          isNewFromLearning: true,
          tag: 'NEW'
        }))
        .sort((a, b) => b.currentScore - a.currentScore)
        .slice(0, Math.ceil(targetIncrease / 5)); // More new channels for higher targets

      // Sensitivity factor based on target increase
      const sensitivityFactor = 1 + (targetIncrease / 100) * 2;

      // Sort all channels by current score
      const allChannels = [...optimizedChannels, ...potentialNewChannels];
      allChannels.sort((a, b) => b.currentScore - a.currentScore);

      // Calculate score percentiles
      const scores = allChannels.map(c => c.currentScore).sort((a, b) => b - a);
      const topTierThreshold = scores[Math.floor(scores.length * 0.3)] || 0;
      const bottomTierThreshold = scores[Math.floor(scores.length * 0.7)] || 0;

      // Phase 1: Identify channels to reduce/drop (low score, long tail)
      let budgetToReallocate = 0;
      const dropThreshold = scores[Math.floor(scores.length * 0.85)] || 0;

      optimizedChannels.forEach(channel => {
        if (!channel.isShortTail) {
          if (channel.currentScore <= dropThreshold && optimizedChannels.filter(c => c.newCost > 0).length > CONFIG.MIN_ACTIVE_CHANNELS) {
            // Drop this channel entirely
            budgetToReallocate += channel.newCost;
            channel.newCost = 0;
            channel.tag = 'DROPPED';
          } else if (channel.currentScore < bottomTierThreshold) {
            // Reduce this channel significantly
            const reductionRate = Math.min(0.9, 0.5 * sensitivityFactor);
            const reduction = channel.newCost * reductionRate;
            channel.newCost -= reduction;
            budgetToReallocate += reduction;
          } else if (channel.currentScore < topTierThreshold) {
            // Moderate reduction
            const reductionRate = Math.min(0.5, 0.25 * sensitivityFactor);
            const reduction = channel.newCost * reductionRate;
            channel.newCost -= reduction;
            budgetToReallocate += reduction;
          }
        } else {
          // Short tail: only minor adjustments if low score
          if (channel.currentScore < bottomTierThreshold) {
            const reduction = channel.newCost * CONFIG.SHORT_TAIL_ADJUSTMENT_LIMIT;
            channel.newCost -= reduction;
            budgetToReallocate += reduction;
          }
        }
      });

      // Phase 2: Distribute budget to high-score channels
      const beneficiaries = [...optimizedChannels.filter(c => c.currentScore >= topTierThreshold), ...potentialNewChannels];
      const totalBeneficiaryScore = beneficiaries.reduce((sum, c) => sum + c.currentScore, 0);

      beneficiaries.forEach(channel => {
        if (totalBeneficiaryScore > 0) {
          const share = channel.currentScore / totalBeneficiaryScore;
          let addition = budgetToReallocate * share * sensitivityFactor;

          // Short tail constraint
          if (channel.isShortTail && !channel.isNewFromLearning) {
            const maxIncrease = channel.originalCost * CONFIG.SHORT_TAIL_ADJUSTMENT_LIMIT * 2;
            addition = Math.min(addition, maxIncrease);
          }

          // Concentration cap
          const maxAllowed = totalCost * CONFIG.MAX_CHANNEL_CONCENTRATION;
          addition = Math.min(addition, maxAllowed - channel.newCost);

          channel.newCost += Math.max(0, addition);
        }
      });

      // Merge new channels into optimized list
      const finalChannels = [...optimizedChannels, ...potentialNewChannels.filter(c => c.newCost > 0)];

      // Normalize to keep total cost constant
      const newTotalCost = finalChannels.reduce((sum, c) => sum + c.newCost, 0);
      const normalizationFactor = totalCost / newTotalCost;

      finalChannels.forEach(channel => {
        channel.newCost *= normalizationFactor;
        channel.newCostShare = (channel.newCost / totalCost) * 100;
        channel.change = channel.newCost - channel.originalCost;
        channel.changePercent = channel.originalCost > 0
          ? ((channel.newCost - channel.originalCost) / channel.originalCost) * 100
          : (channel.newCost > 0 ? 100 : 0);

        // Set tags
        if (channel.tag !== 'DROPPED' && channel.tag !== 'NEW') {
          if (channel.change > channel.originalCost * 0.02) {
            channel.tag = 'INCREASE';
          } else if (channel.change < -channel.originalCost * 0.02) {
            channel.tag = 'DECREASE';
          } else {
            channel.tag = 'UNCHANGED';
          }
        }
      });

      // Calculate new metrics
      const calculateNewMetric = (channels, metricKey) => {
        return channels.reduce((sum, c) => {
          const originalValue = c[metricKey] || 0;
          const originalCost = c.originalCost || c.Cost || 1;
          const ratio = originalValue / originalCost;
          return sum + (ratio * c.newCost);
        }, 0);
      };

      const newImpact = calculateNewMetric(finalChannels, 'Impact');
      const newReach = finalChannels.reduce((sum, c) => {
        // For reach, we use a simplified model - reach increases with sqrt of cost increase
        const costRatio = c.originalCost > 0 ? c.newCost / c.originalCost : 1;
        return sum + (c.SyncReach * Math.sqrt(costRatio));
      }, 0);
      const newGRP = calculateNewMetric(finalChannels, 'GRP');

      // Filter out channels with negligible spend
      const activeChannels = finalChannels.filter(c => c.newCost > 1000 || c.originalCost > 0);

      setOptimizedPlan({
        original: {
          channels: channels,
          totalCost,
          totalImpact,
          totalReach,
          totalGRP: analyzeChannels.totalGRP
        },
        optimized: {
          channels: activeChannels.sort((a, b) => b.newCost - a.newCost),
          totalCost,
          totalImpact: newImpact,
          totalReach: newReach,
          totalGRP: newGRP
        },
        improvement: {
          impact: ((newImpact - totalImpact) / totalImpact) * 100,
          reach: ((newReach - totalReach) / totalReach) * 100,
          grp: ((newGRP - analyzeChannels.totalGRP) / analyzeChannels.totalGRP) * 100
        },
        learningSource,
        optimizationMetric,
        summary: {
          increased: activeChannels.filter(c => c.tag === 'INCREASE').length,
          decreased: activeChannels.filter(c => c.tag === 'DECREASE').length,
          dropped: channels.filter(c => c.tag === 'DROPPED').length,
          new: activeChannels.filter(c => c.tag === 'NEW').length
        }
      });

      setIsOptimizing(false);
    }, 600);
  };

  // Tag component
  const ChannelTag = ({ tag }) => {
    const styles = {
      INCREASE: { bg: '#dcfce7', color: '#166534', icon: '↑' },
      DECREASE: { bg: '#fee2e2', color: '#991b1b', icon: '↓' },
      DROPPED: { bg: '#f3f4f6', color: '#374151', icon: '✕' },
      NEW: { bg: '#fff7ed', color: '#c2410c', icon: '★' },
      UNCHANGED: { bg: '#f1f5f9', color: '#475569', icon: '—' }
    };
    const style = styles[tag] || styles.UNCHANGED;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        background: style.bg,
        color: style.color
      }}>
        {style.icon} {tag}
      </span>
    );
  };

  const renderComparisonTable = () => {
    if (!optimizedPlan) return null;

    const { optimized } = optimizedPlan;

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: COLORS.primary, color: 'white' }}>
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600 }}>Channel</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Genre</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Reach %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>
                {optimizationMetric === 'reach' ? 'Reach Score' : 
                 optimizationMetric === 'impact_reach' ? 'Impact/Reach' : 'Impact/Cost'}
              </th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Old Cost</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Old %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>New Cost</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>New %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {optimized.channels.map((channel, idx) => {
              const changeColor = channel.change > 0 ? COLORS.success : channel.change < 0 ? COLORS.danger : COLORS.muted;
              
              return (
                <tr 
                  key={idx} 
                  style={{ 
                    background: channel.tag === 'DROPPED' ? '#fafafa' : idx % 2 === 0 ? 'white' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    opacity: channel.tag === 'DROPPED' ? 0.6 : 1
                  }}
                >
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                    {channel.Channel}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <ChannelTag tag={channel.tag} />
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: 12, 
                      fontSize: 10,
                      fontWeight: 700,
                      background: channel.isShortTail ? '#e0f2fe' : '#f3e8ff',
                      color: channel.isShortTail ? COLORS.shortTail : COLORS.longTail,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {channel.isShortTail ? 'Short' : 'Long'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, color: COLORS.muted }}>{channel.Genre}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{channel.SyncReach?.toFixed(2)}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: COLORS.accent }}>
                    {channel.currentScore?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: COLORS.muted }}>
                    {formatCurrency(channel.originalCost)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: COLORS.muted }}>
                    {channel.originalCostShare?.toFixed(1)}%
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatCurrency(channel.newCost)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {channel.newCostShare?.toFixed(1)}%
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: changeColor, fontWeight: 700 }}>
                    {channel.changePercent > 0 ? '+' : ''}{channel.changePercent?.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPieCharts = () => {
    if (!optimizedPlan) return null;

    const { original, optimized } = optimizedPlan;

    const originalPieData = original.channels
      .sort((a, b) => b.Cost - a.Cost)
      .slice(0, 10)
      .map(c => ({ name: c.Channel, value: c.costShare }));

    const optimizedPieData = optimized.channels
      .filter(c => c.newCost > 0)
      .sort((a, b) => b.newCost - a.newCost)
      .slice(0, 10)
      .map(c => ({ name: c.Channel, value: c.newCostShare }));

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', color: COLORS.primary, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Mix (Top 10)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={originalPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${value.toFixed(1)}%`}
                labelLine={true}
              >
                {originalPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', color: COLORS.success, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Optimized Mix (Top 10)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={optimizedPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${value.toFixed(1)}%`}
                labelLine={true}
              >
                {optimizedPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderScoreChart = () => {
    if (!analyzeChannels) return null;

    const metricLabel = optimizationMetric === 'reach' ? 'Reach Score' : 
                       optimizationMetric === 'impact_reach' ? 'Impact/Reach' : 'Impact/Cost';

    const data = analyzeChannels.channels.map(c => ({
      name: c.Channel,
      score: calculateScore(c, optimizationMetric),
      reach: c.SyncReach,
      isShortTail: c.isShortTail
    })).sort((a, b) => b.score - a.score).slice(0, 15);

    return (
      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 20px', color: COLORS.primary, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Channel Ranking by {metricLabel}
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{metricLabel}: <strong>{d.score.toFixed(2)}</strong></div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Reach: <strong>{d.reach.toFixed(2)}%</strong></div>
                      <div style={{ fontSize: 11, marginTop: 6, color: d.isShortTail ? COLORS.shortTail : COLORS.longTail, fontWeight: 600 }}>
                        {d.isShortTail ? '● Short Tail' : '○ Long Tail'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" name={metricLabel} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isShortTail ? COLORS.shortTail : COLORS.longTail} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.shortTail }}></span> Short Tail (High Reach)
          </span>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.longTail }}></span> Long Tail
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: 24
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '36px 44px',
        marginBottom: 24,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: 300, 
          height: 300, 
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>
              TV Campaign Optimizer
            </h1>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: 15, fontWeight: 500 }}>
              Garnier Hair Care • Cross-Media Measurement & Attribution
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Powered by</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>SYNC</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        background: 'white', 
        borderRadius: 12, 
        padding: 28, 
        marginBottom: 24,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
          {/* Region Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setOptimizedPlan(null);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="">Choose a region...</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Optimize For
            </label>
            <select
              value={optimizationMetric}
              onChange={(e) => {
                setOptimizationMetric(e.target.value);
                setOptimizedPlan(null);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="reach">Reach (Maximize Coverage)</option>
              <option value="impact_reach">Impact / Reach (Impact Density)</option>
              <option value="impact_cost">Impact / Cost (Efficiency)</option>
            </select>
          </div>

          {/* Target Increase */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Optimization Intensity: <span style={{ color: COLORS.accent }}>{targetIncrease}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={targetIncrease}
              onChange={(e) => {
                setTargetIncrease(parseInt(e.target.value));
                setOptimizedPlan(null);
              }}
              style={{ width: '100%', marginTop: 8, accentColor: COLORS.accent }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: COLORS.muted, marginTop: 6 }}>
              <span>Conservative (5%)</span>
              <span>Aggressive (30%)</span>
            </div>
          </div>

          {/* Short Tail Threshold */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Short Tail Threshold: <span style={{ color: COLORS.shortTail }}>{shortTailThreshold}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={shortTailThreshold}
              onChange={(e) => {
                setShortTailThreshold(parseInt(e.target.value));
                setOptimizedPlan(null);
              }}
              style={{ width: '100%', marginTop: 8, accentColor: COLORS.shortTail }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: COLORS.muted, marginTop: 6 }}>
              <span>Fewer Protected (50%)</span>
              <span>More Protected (90%)</span>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={runOptimization}
            disabled={!selectedRegion || isOptimizing}
            style={{
              padding: '16px 56px',
              fontSize: 15,
              fontWeight: 700,
              color: 'white',
              background: !selectedRegion ? COLORS.muted : `linear-gradient(135deg, ${COLORS.accent} 0%, #ea580c 100%)`,
              border: 'none',
              borderRadius: 10,
              cursor: !selectedRegion ? 'not-allowed' : 'pointer',
              boxShadow: !selectedRegion ? 'none' : '0 4px 14px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {/* Analysis Summary */}
      {analyzeChannels && (
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 24, 
          marginBottom: 24,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.primary }}>
              {selectedRegion} Market Analysis
            </h3>
            {analyzeChannels.learningSource && (
              <div style={{ 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '8px 16px', 
                borderRadius: 8, 
                fontSize: 12,
                fontWeight: 600
              }}>
                ⚡ Learning from Godrej (No Garnier data)
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary }}>{analyzeChannels.channels.length}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Channels</div>
            </div>
            <div style={{ background: '#e0f2fe', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.shortTail }}>{analyzeChannels.shortTailCount}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Short Tail</div>
            </div>
            <div style={{ background: '#f3e8ff', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.longTail }}>{analyzeChannels.longTailCount}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Long Tail</div>
            </div>
            <div style={{ background: '#dcfce7', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.success }}>{formatCurrency(analyzeChannels.totalCost)}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Budget</div>
            </div>
            <div style={{ background: '#fff7ed', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>{analyzeChannels.totalImpact.toFixed(0)}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Impact</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Chart (before optimization) */}
      {analyzeChannels && !optimizedPlan && renderScoreChart()}

      {/* Optimization Results */}
      {optimizedPlan && (
        <>
          {/* Results Summary */}
          <div style={{ 
            background: `linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%)`,
            borderRadius: 12,
            padding: 28,
            marginBottom: 24,
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Optimization Results</h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 16px', 
                borderRadius: 8, 
                fontSize: 12,
                fontWeight: 600
              }}>
                Optimized for: {optimizationMetric === 'reach' ? 'REACH' : optimizationMetric === 'impact_reach' ? 'IMPACT/REACH' : 'IMPACT/COST'}
              </div>
            </div>
            
            {/* Summary Tags */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{optimizedPlan.summary.increased}</span>
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.9 }}>↑ Increased</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{optimizedPlan.summary.decreased}</span>
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.9 }}>↓ Decreased</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{optimizedPlan.summary.dropped}</span>
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.9 }}>✕ Dropped</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{optimizedPlan.summary.new}</span>
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.9 }}>★ New (from Godrej)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Budget (Unchanged)</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{formatCurrency(optimizedPlan.original.totalCost)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Impact Change</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
                  {optimizedPlan.improvement.impact > 0 ? '+' : ''}{optimizedPlan.improvement.impact.toFixed(1)}%
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Reach Change</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
                  {optimizedPlan.improvement.reach > 0 ? '+' : ''}{optimizedPlan.improvement.reach.toFixed(1)}%
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>GRP Change</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
                  {optimizedPlan.improvement.grp > 0 ? '+' : ''}{optimizedPlan.improvement.grp.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'comparison', label: 'Channel Comparison' },
              { id: 'charts', label: 'Mix Charts' },
              { id: 'scores', label: 'Score Analysis' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                style={{
                  padding: '12px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: viewMode === tab.id ? 'white' : COLORS.primary,
                  background: viewMode === tab.id ? COLORS.primary : 'white',
                  border: `2px solid ${COLORS.primary}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content based on view mode */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            {viewMode === 'comparison' && renderComparisonTable()}
            {viewMode === 'charts' && renderPieCharts()}
            {viewMode === 'scores' && renderScoreChart()}
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedRegion && (
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 80, 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📺</div>
          <h3 style={{ margin: '0 0 10px', color: COLORS.primary, fontSize: 22, fontWeight: 700 }}>Select a Region to Begin</h3>
          <p style={{ margin: 0, color: COLORS.muted, fontSize: 15 }}>
            Choose a region from the dropdown to analyze channel performance and run optimization simulations.
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: 'center', color: COLORS.muted, fontSize: 12 }}>
        <p style={{ margin: 0, fontWeight: 500 }}>
          TV Campaign Optimization System • Cross-Media Measurement • Powered by <span style={{ color: COLORS.accent, fontWeight: 700 }}>SYNC</span>
        </p>
      </div>
    </div>
  );
}

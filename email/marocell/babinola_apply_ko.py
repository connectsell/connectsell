# -*- coding: utf-8 -*-
"""Restore Korean in babinola.html (UTF-8). ASCII-only source. Run: python email/marocell/babinola_apply_ko.py"""
import codecs
from pathlib import Path


def d(s: str) -> str:
    return codecs.decode(s, "unicode_escape")


ROOT = Path(__file__).resolve().parents[2]
p = ROOT / "email" / "marocell" / "babinola.html"
lines = p.read_text(encoding="utf-8").splitlines()

lines[33] = d(r"<!-- \uC81C\uBAA9 -->")

lines[39] = (
    '<td align="center" style="padding:12px 10px;font-size:16px;font-weight:600;color:#2d3e50;">ConnectSell '
    + d(r"\uacf5\ub3d9\uad6c\ub9e4\ub97c \uc81c\uc548\ud558\ub294 \ud611\uc5c5")
    + "</td>"
)

lines[46] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(r"\uc548\ub155\ud558\uc138\uc694")
    + ".<br>"
    + d(r"\ub2e4\uc774\uc5b4\ud2b8\xb7\ub77c\uc774\ud504\ucf00\uc5b4 \ub4f1 \uce74\ud14c\uace0\ub9ac\ub97c \uc911\uc2ec\uc73c\ub85c")
    + "<br>"
    + d(r"\uacf5\ub3d9\uad6c\ub9e4\ub97c \uae30\ud68d\xb7\uc6b4\uc601\ud558\uace0 \uc788\ub294 ConnectSell\uc785\ub2c8\ub2e4.")
    + "</p>"
)

lines[47] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(r"\ud06c\ub9ac\uc5d0\uc774\ud130\ub2d8\uc758 \ucf58\ud150\uce20 \ubc29\ud5a5\uc131\uacfc \uc798 \ub9de\ub294 \uc0c1\ud488\uc774\ub77c \uc2dd\ub2e8 \ucf00\uc5b4")
    + "<br>"
    + d(r"\ud611\uc5c5 \uc81c\uc548\uc744 \ub4dc\ub9ac\uace0\uc790 \uc5f0\ub77d\ub4dc\ub838\uc2b5\ub2c8\ub2e4.")
    + "</p>"
)

lines[48] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc2dd\ub2e8 \uad00\ub9ac\uc5d0\uc11c \uac00\uc7a5 \uc5b4\ub824\uc6b4 \uac83\uc740 \ubb34\uc5c7\ubcf4\ub2e4 \uafb8\uc900\ud788 \uc774\uc5b4\uac00\ub294 \uac83\uc774\ub77c\uace0 \uc0dd\uac01\ud569\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[49] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc800\ub2f9\xb7\uce7c\ub85c\ub9ac \uc81c\ud488\uc744 \uad6c\ub9e4\ud574\ub3c4 \ub9c9\uc0c1 \uc785\uc5d0 \ud55c \uac00\uc9c0 \ub9db\ub9cc \uba70\uce60 \uc9c0\ub098\uba74 \uc2eb\uc5b4\uc838\ubc84\ub9b0 \uacbd\ud5d8 \uc788\uc73c\uc2dc\uc9c0 \uc54a\uc73c\uc2e4\uae4c\uc694?"
    )
    + "</p>"
)

lines[50] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uacb0\uad6d \uc2dd\ub2e8\uc774 \ubb34\ub108\uc9c0\ub294 \uc21c\uac04\uc740 \ucc38\ub2e4 \ucc38\ub2e4\uac00 \uac11\uc790\uae30 \uc785\uc774 \uc800\uc9c8\ub7ec\ubc84\ub9b0 \uc21c\uac04\uc774\ub77c\uace0 \uc0dd\uac01\ud569\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[51] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(r"\uadf8\ub798\uc11c \uc694\uc998\uc740 \ucc38\ub294 \ub2e4\uc774\uc5b4\ud2b8\ubcf4\ub2e4, <strong>\uacc4\uc18d \uba39\uc744 \uc218 \uc788\ub294 \ub8e8\ud2f4</strong>\uc774 \ub354 \uc911\uc694\ud574\uc84c\uc2b5\ub2c8\ub2e4.")
    + "</p>"
)

lines[52] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc774\ubc88\uc5d0 \uc18c\uac1c\ub4dc\ub9ac\ub294 <strong>\ubc14\ube44\ub180\ub77c(Babinola)</strong>\ub294 \uc0c1\uc0c1 \uc18d \uac04\ud3b8\ud558\uac8c \uba39\uc744 \uc218 \uc788\ub294 \uac04\uc2dd\uc73c\ub85c \ubd80\ub2f4 \uc5c6\uc774 \uc774\uc5b4\uac08 \uc218 \uc788\ub3c4\ub85d \uae30\ud68d\ud55c \uadf8\ub798\ub180\ub77c \uc0c1\ud488\uc785\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[53] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc18c\uc18c\ud55c \uc2dd\ub2e8\xb7\uac04\uc2dd\xb7\ub77c\uc774\ud504 \ub8e8\ud2f4\uc744 \uc911\uc2ec\uc73c\ub85c \uacf5\uac10\uc744 \uc8fc\uace0 \uc131\uc7a5\ud574 \uc628 \ucf58\ud150\uce20 \ud1a4\uacfc\ub3c4 \uc798 \ub9de\uc744 \uac83 \uac19\uc544, \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub9de\ucd9c \uc218 \uc788\ub294 \uacf5\ub3d9\uad6c\ub9e4 \ud611\uc5c5\uc744 \uc81c\uc548\ub4dc\ub9ac\uace0\uc790 \uc5f0\ub77d\ub4dc\ub838\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[59] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Brand</td>")
)

lines[60] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:600;color:#2d3e50;line-height:1.45;">'
    + d(r"\uc720\ud29c\ubc84 \ud788\ubc25 \xd7 \ub9c8\ub85c\uc140 \uacf5\ub3d9\uac1c\ubc1c \ubc14\ube44\ub180\ub77c</td>")
)

lines[67] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-brand-banner.jpg" alt="'
    + d(r"\uc720\ud29c\ubc84 \ud788\ubc25 \xd7 \ub9c8\ub85c\uc140 \uacf5\ub3d9\uac1c\ubc1c \ubc14\ube44\ub180\ub77c")
    + '" width="560" style="width:100%;height:auto;display:block;border:0;">'
)

lines[71] = (
    '<p style="margin:0;padding:16px 0 12px 0;font-size:14px;line-height:1.6;color:#333333;text-align:justify;">'
    + d(
        r"\ubc14\ube44\ub180\ub77c\ub294 \ud06c\ub9ac\uc5d0\uc774\ud130 <strong>\ud788\ubc25</strong>\uacfc \ud568\uaed8 \ub9db\uacfc \uad6c\uc131\uc744 \uace0\ubbfc\ud574 \ub9cc\ub4e0 \ubc14\uc0ad\ud55c \uadf8\ub798\ub180\ub77c \uc0c1\ud488\uc785\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[72] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;text-align:justify;"><strong>'
    + d(r"\uc0c1\uc0c1\uc5d0\uc11c \ubd80\ub2f4 \uc5c6\uc774 \uc990\uae38 \uc218 \uc788\ub294</strong>")
    + d(
        r" \uc9c0\uc18d \uac00\ub2a5\ud55c \uc2dd\ub2e8 \uad6c\uc131\uc744 \uace0\ub824\ud574 \ub9cc\ub4e4\uc5b4\uc9c4 \uc810\uc774 \ud2b9\uc9d5\uc785\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[78] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Hot Keyword</td>")
)

lines[79] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:600;color:#c62828;line-height:1.45;">'
    + d(r"3\ub300 \uc6d0\uce59(\uc124\ud0d5\xb7\ubc00\uac00\ub8e8\xb7\ud31c\uc720 ZERO)</td>")
)

lines[86] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-hotword-left.jpg" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \uc6d0\ub8cc\uc640 \ub808\uc2dc\ud53c")
    + '" width="294" style="width:100%;height:auto;display:block;border:0;">'
)

lines[89] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-hotword-right.jpg" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \uba54\uc774\ud50c \uc2dc\ub7fd\uacfc \ubc14\uc0ad\ud55c \uc2dd\uac10")
    + '" width="294" style="width:100%;height:auto;display:block;border:0;">'
)

lines[94] = (
    '<p style="margin:0;padding:24px 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(r"\ubc14\ube44\ub180\ub77c\ub294 <strong>3\ub300 \uc6d0\uce59(\uc124\ud0d5\xb7\ubc00\uac00\ub8e8\xb7\ud31c\uc720 ZERO)</strong>\uc744 \uae30\uc900\uc73c\ub85c \ubd88\ud544\uc694\ud55c \ucca8\uac00\ubb3c \uc5c6\uc774 \ub9cc\ub4e4\uc5b4\uc9c4 \uadf8\ub798\ub180\ub77c\uc785\ub2c8\ub2e4.")
    + "</p>"
)

lines[95] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>'
    + d(r"100% \uce90\ub098\ub2e4\uc0b0 \uadc0\ub9ac</strong>\uc640 \uc2a4\ud3ec\ud2b8\ubc00, \ud638\ub450, \uce90\uc288\ub11b, \uc544\uba3c\ub4dc, \ud574\ubc14\ub77c\uae30\uc528 \ub4f1\uc744 \ub354\ud574 \ubc14\uc0ad\ud55c \uc2dd\uac10\uacfc \uace0\uc18c\ud55c \ub9db\uc744 \uc0b4\ub838\uc2b5\ub2c8\ub2e4.")
    + "</p>"
)

lines[96] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc800\uc628\ub3c4\uc5d0\uc11c \uc624\ub798 \uc2dc\uac04 \uad6c\uc6cc\ub0b4\ub294 <strong>\uc804\ud1b5 \uc2dc\ub9ac\uc5bc \uc81c\uc870 \ubc29\uc2dd</strong>\uc73c\ub85c \uc2dc\uc791\ud574 \ubd80\ub2f4 \uc5c6\uc774 \uac00\ubcbd\uac8c \uc990\uae38 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[97] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc77c\ubc18 \uc2dc\ub9ac\uc5bc \ub300\ube44 <strong>\ud0c4\uc218\ud654\ubb3c\uc740 \ub0ae\uac8c(4g)</strong>, <strong>\ub2e8\ubc31\uc9c8\uc740 \ucda9\ubd84\ud788(15g)</strong>\uc774\ub77c \uac04\ud3b8\ud558\uac8c \ud55c \uc2a4\ud3b4\ub85c\ub3c4 \ud3ec\ub9cc\uac10\uc744 \ub290\ub08c \uc218 \uc788\ub3c4\ub85d \uad6c\uc131\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[98] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>'
    + d(r"\uc6b0\uc720</strong>\ub97c \uc0ac\uc6a9\ud558\uc9c0 \uc54a\uace0 \uacac\uacfc\ub958 \uae30\ubc18\uc758 \uc9c0\ubc29\uc73c\ub85c \ucc44\uc6cc <strong>\ud2b8\ub79c\uc2a4\uc9c0\ubc29 \uc5c6\uc774</strong> \uade0\ud615 \uc7a1\ud78c \uc7ac\ub8cc\ub97c \uc124\uacc4\ud588\uc2b5\ub2c8\ub2e4.")
    + "</p>"
)

lines[104] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Chapter 1</td>")
)

lines[105] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:700;color:#2d3e50;line-height:1.45;">'
    + d(r"\uc81c\ud488 \uae30\ubcf8\uc815\ubcf4</td>")
)

lines[110] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-chapter1-left.jpg" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \uadf8\ub798\ub180\ub77c \uc81c\ud488 \ud328\ud0a4\uc9c0")
    + '" width="560" style="width:100%;height:auto;display:block;border:0;border-radius:12px;">'
)

lines[114] = (
    '<td width="25%" align="center" style="padding:12px 10px;font-size:17px;font-weight:600;color:#2d3e50;background-color:#f3f6f4;border-right:1px solid #e8ebe9;border-bottom:1px solid #e8ebe9;">'
    + d(r"\ud488\uba85</td>")
)

lines[115] = (
    '<td align="center" style="padding:12px 10px;font-size:17px;line-height:1.55;color:#3d4f42;background-color:#ffffff;border-bottom:1px solid #e8ebe9;">'
    + d(r"\ubc14\ube44\ub180\ub77c(Babinola) \uadf8\ub798\ub180\ub77c</td>")
)

lines[118] = (
    '<td width="25%" align="center" style="padding:12px 10px;font-size:17px;font-weight:600;color:#2d3e50;background-color:#f3f6f4;border-right:1px solid #e8ebe9;border-bottom:1px solid #e8ebe9;">'
    + d(r"\uc81c\ud488\uc720\ud615</td>")
)

lines[119] = (
    '<td align="center" style="padding:12px 10px;font-size:17px;line-height:1.55;color:#3d4f42;background-color:#ffffff;border-bottom:1px solid #e8ebe9;">'
    + d(r"\uace1\ubb3c\uac00\uacf5\ud488 (\uadf8\ub798\ub180\ub77c)</td>")
)

lines[126] = (
    '<td width="25%" align="center" style="padding:12px 10px;font-size:17px;font-weight:600;color:#2d3e50;background-color:#f3f6f4;border-right:1px solid #e8ebe9;border-bottom:1px solid #e8ebe9;">'
    + d(r"\uc8fc\uc694\uc6d0\ub8cc</td>")
)

lines[127] = (
    '<td align="center" style="padding:12px 10px;font-size:17px;line-height:1.55;color:#3d4f42;background-color:#ffffff;border-bottom:1px solid #e8ebe9;">'
    + d(
        r"\uce90\ub098\ub2e4\uc0b0 \uadc0\ub9ac, \uc2a4\ud3ec\ud2b8\ubc00, \ud638\ub450, \uce90\uc288\ub11b, \uc544\uba3c\ub4dc, \ud574\ubc14\ub77c\uae30\uc528 \ub4f1</td>"
    )
)

lines[130] = (
    '<td width="25%" align="center" style="padding:12px 10px;font-size:17px;font-weight:600;color:#2d3e50;background-color:#f3f6f4;border-right:1px solid #e8ebe9;border-bottom:1px solid #e8ebe9;">'
    + d(r"\uc81c\ud488\ud2b9\uc9d5</td>")
)

lines[131] = (
    '<td align="center" style="padding:12px 10px;font-size:17px;line-height:1.55;color:#3d4f42;background-color:#ffffff;border-bottom:1px solid #e8ebe9;">'
    + d(r"100% \ud578\ub4dc\uba54\uc774\ub4dc \uc2dc\ub9ac\uc5bc \uc81c\uc870 \ubc29\uc2dd</td>")
)

lines[134] = (
    '<td width="25%" align="center" style="padding:12px 10px;font-size:17px;font-weight:600;color:#2d3e50;background-color:#f3f6f4;border-right:1px solid #e8ebe9;">'
    + d(r"\uc601\uc591\uc815\ubcf4</td>")
)

lines[135] = (
    '<td align="center" style="padding:12px 10px;font-size:17px;line-height:1.55;color:#3d4f42;background-color:#ffffff;">'
    + d(
        r"\ud0c4\uc218\ud654\ubb3c 4g / \ub2e8\ubc31\uc9c8 15g / \ud2b8\ub79c\uc2a4\uc9c0\ubc29 0g (100g \uae30\uc900)</td>"
    )
)

lines[143] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Chapter 2</td>")
)

lines[151] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-chapter2-checkpoint.png?v=20260331" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \ub2e8\ubc31\uc9c8 \uc591 UP \uce7c\ub85c\ub9ac \ubd80\ub2f4 DOWN")
    + '" width="560" style="width:100%;height:auto;display:block;border:0;border-radius:8px;">'
)

lines[161] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>'
    + d(r"100% \uc218\uc81c \uc2dc\ub9ac\uc5bc</strong> \uace0\ud488\uc9c8 \uc7ac\ub8cc</td>")
)

lines[169] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>'
    + d(r"\uce90\ub098\ub2e4\uc0b0 \uba54\uc774\ud50c \uc2dc\ub7fd</strong>\uc73c\ub85c \ubc14\uc0ad\ud55c \uc2dd\uac10</td>")
)

lines[177] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>'
    + d(r"\uace0\ub2e8\ubc31</strong>, \uce7c\ub85c\ub9ac \ubd80\ub2f4 ZERO</td>")
)

lines[185] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>NO</strong> '
    + d(r"\uc124\ud0d5 \xb7 \ubc00\uac00\ub8e8 \xb7 \uc778\uacf5\ucca8\uac00\ubb3c \xb7 \ud569\uc131\uac10\ubbf8\ub8cc</td>")
)

lines[193] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>HACCP</strong> '
    + d(r"\uc548\uc804\uad00\ub9ac\uc778\uc99d \uae30\uc900 \uc704\uc0dd \uc778\uc99d \uc81c\uc870</td>")
)

lines[206] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Chapter 3</td>")
)

lines[207] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:700;color:#2d3e50;line-height:1.45;">'
    + d(r"\uc2a4\ud1a0\uc5b4 \ub9ac\ubdf0 \ud3c9\uc810 4.75/5</td>")
)

lines[214] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-store-review.jpg" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \uc81c\ud488\ub9ac\ubdf0 \ud3c9\uc810 4.75")
    + '" width="560" style="width:100%;height:auto;display:block;border:0;border-radius:8px;">'
)

lines[219] = (
    '<p style="margin:0;padding:32px 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uccb4\ud5d8\ub2e8 \ucf58\ud150\uce20\ub294 \ud06c\ub9ac\uc5d0\uc774\ud130\ub2d8\uc758 <strong>\uc77c\uc0c1 \uc18d \uc2dd\ub2e8 \ub8e8\ud2f4</strong>\uc5d0 \ub9de\ucdb0 \uc790\uc5f0\uc2a4\ub7fd\uac8c \uc5ec\uc5fc \uc18c\uac1c\ud574 \uc8fc\uc154\ub3c4 \uc88b\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[220] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc694\uac70\ud2b8\xb7\uc6b0\uc720\uc640 \ud568\uaed8\ud558\ub294 <strong>\uac04\ud3b8\ud55c \uc544\uce68 \ub8e8\ud2f4</strong>, \uac04\uc2dd \ud0c0\uc784\xb7\uc2dd\ub2e8 \uad00\ub9ac \ube0c\uc774\ub85c\uadf8 \ub4f1 \uc2e4\uc81c \uc0dd\ud65c \uc18d \ubaa8\uc2b5\uc73c\ub85c \ub2f4\uc544 \uc8fc\uc2dc\uba74 \uacf5\uac10\uacfc \ubc18\uc751\uc744 \uc774\ub04c\uc5b4 \ub0bc \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[221] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\uc694\uac70\ud2b8\ubcfc\xb7\uacfc\uc77c \ud1a0\ud551 \ub4f1 <strong>\uac04\ub2e8\ud55c \ub808\uc2dc\ud53c</strong>\ub85c\ub3c4 \ud655\uc7a5 \uac00\ub2a5\ud558\uba70, \ud544\uc694 \uc2dc <strong>\ucd08\uc5c5 \uac00\uc774\ub4dc</strong>\ub97c \ubcc4\ub3c4\ub85c \uc804\ub2ec\ub4dc\ub9b4 \uc608\uc815\uc785\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[227] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Chapter 4</td>")
)

lines[228] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:700;color:#2d3e50;line-height:1.45;">'
    + d(r"\ucf58\ud150\uce20 \ub808\ud37c\ub7f0\uc2a4</td>")
)

lines[235] = (
    '<img src="https://www.connectsell.co.kr/email/images/babinola-chapter4-reference.jpg" alt="'
    + d(r"\ubc14\ube44\ub180\ub77c \ucf58\ud150\uce20 \ub7ec\ud37c\ub7f0\uc2a4 \uc774\ubbf8\uc9c0")
    + '" width="560" style="width:100%;height:auto;display:block;border:0;border-radius:8px;">'
)

lines[245] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;">'
    + d(r"\uc544\uce68 <strong>\uc694\uac70\ud2b8\ubcfc</strong> \ub370\uc77c\ub9ac \ub8e8\ud2f4 \ucf58\ud150\uce20</td>")
)

lines[253] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;">'
    + d(r"\uac04\uc2dd \ud0c0\uc784 \xb7 <strong>\uc0ac\ubb34\uc2e4 \ubc29\ubb38</strong> \uac04\uc2dd \ucf58\ud150\uce20</td>")
)

lines[261] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;"><strong>'
    + d(r"\uc2dd\ub2e8 \uad00\ub9ac \ube0c\uc774\ub85c\uadf8</strong> (\ud558\ub8e8 \uc2dd\ub2e8 \uae30\ub85d)</td>")
)

lines[269] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;">'
    + d(r"\ub2e4\uc774\uc5b4\ud2b8\uc640 <strong>\uac04\ud3b8 \ub8e8\ud2f4</strong></td>")
)

lines[277] = (
    '<td style="padding:16px 20px 16px 10px;font-size:17px;line-height:1.55;font-weight:500;color:#3d4f42;vertical-align:middle;">'
    + d(r"\uc694\uac70\ud2b8\xb7\uc6b0\uc720\xb7\uacfc\uc77c <strong>\ud1a0\ud551 \ub808\uc2dc\ud53c</strong> \ucf58\ud150\uce20</td>")
)

lines[290] = (
    '<td width="26%" style="padding:10px 12px;background-color:#ffffff;font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;">'
    + d(r"\u25c6 Special Price</td>")
)

lines[291] = (
    '<td width="74%" align="center" style="padding:10px 12px;background-color:#e5ede6;font-size:16px;font-weight:700;color:#2d3e50;line-height:1.45;">'
    + d(r"\ub2e4\uc774\uc5b4\ud2b8 \ud2b9\ubcc4\uae30\ud68d \uad6c\uc131</td>")
)

lines[295] = (
    '<p style="margin:0;padding:24px 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\ubc14\ube44\ub180\ub77c\ub294 \ub2e8\uc21c \uccb4\ud5d8\uc774 \uc544\ub2cc <strong>\ucf58\ud150\uce20 \ud1a4</strong>\uc5d0 \ub9de\ucdb0 \uc790\uc5f0\uc2a4\ub7fd\uac8c \uc5b4\uc6b8 \uc218 \uc788\ub294 \uad6c\uc870\ub85c <strong>\uacf5\ub3d9\uad6c\ub9e4</strong> \uae30\ud68d\uc774 \uac00\ub2a5\ud558\ub3c4\ub85d \uc900\ube44\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[296] = (
    '<p style="margin:0;padding:0 0 12px 0;font-size:14px;line-height:1.6;color:#333333;">'
    + d(
        r"\ud06c\ub9ac\uc5d0\uc774\ud130\ub2d8\uc758 \ucf58\ud150\uce20 \ubc29\ud5a5\uacfc \ud0c0\uac9f\uc5d0 \ub9de\ucdb0 <strong>\uad6c\uc131\xb7\uc870\uac74</strong>\uc744 \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub9de\ucdb0 \ub4dc\ub9ac\uba70, \uae30\uc874 \uacf5\uad6c \ub300\ube44 <strong>\uba54\ub9ac\ud2b8 \uc788\ub294 \ubc29\ud5a5</strong>\uc73c\ub85c \uc81c\uc548\ub4dc\ub9b4 \uc608\uc815\uc785\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[297] = (
    '<p style="margin:0;padding:0 0 24px 0;font-size:14px;line-height:1.6;color:#2d3e50;font-weight:600;">'
    + d(
        r"\uad00\uc2ec \uc788\uc73c\uc2dc\uba74 \uac04\ub2e8\ud788 \ud68c\uc2e0 \uc8fc\uc2dc\uba74 \uc138\ubd80 \uad6c\uc131\uacfc \uc870\uac74 \uc548\ub0b4\ub4dc\ub9ac\uaca0\uc2b5\ub2c8\ub2e4."
    )
    + "</p>"
)

lines[302] = (
    '<a href="https://www.connectsell.co.kr/form?product=%EB%B0%94%EB%B9%84%EB%86%80%EB%9D%BC" style="display:inline-block;padding:14px 32px;background-color:#2d3e50;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;">'
    + d(r"\uc0d8\ud50c\uccb4\ud5d8 \uc2e0\uccad</a>")
)

lines[312] = (
    '<td align="center" style="padding:0 0 6px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">'
    + d(r"\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \ub9c8\ud3ec\uad6c \ub9c8\ud3ec\ub300\ub85c 2, 13\uce35 1328\ud638</td>")
)

text = "\n".join(lines) + "\n"
if "\ufffd" in text:
    raise SystemExit("U+FFFD still present")
p.write_text(text, encoding="utf-8", newline="\n")
print("OK", p.stat().st_size)

# -*- coding: utf-8 -*-
"""Downloads 폴더의 이메일링_260302.xlsx 로 발송 스크립트 실행."""
import sys
from pathlib import Path

# 이 파일이 있는 폴더로 이동해 send_emails 모듈 실행
SCRIPT_DIR = Path(__file__).resolve().parent
excel_path = Path(r"C:\Users\USER\Downloads\이메일링_260302.xlsx")

if not excel_path.exists():
    print(f"엑셀 파일이 없습니다: {excel_path}")
    print("Downloads 폴더에 '이메일링_260302.xlsx'를 넣은 뒤 다시 실행하세요.")
    sys.exit(1)

# send_emails 의 main 을 해당 엑셀 경로로 실행
sys.argv = [__file__, str(excel_path)]
import send_emails
send_emails.main()

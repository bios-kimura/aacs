/*
The MIT License

Copyright (c) 2013 株式会社バイオス (http://www.bios-net.co.jp/index.html)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
#include <XBee.h>
#include <SoftwareSerial.h>
#include <SD.h>
#include <Watchdog.h>
#include <Sleep.h>

const int IR_OUT = 3; // 赤外線LED
const int CHIP_SELECT = 4; // マイクロSDカード使用時は4番で固定
const int DEFAULT_CS = 10; // デフォルトのCS
const int XBEE_SLEEP_PIN = 9; // XBeeスリープ入力

XBee xbee = XBee();
ZBRxResponse zbRx = ZBRxResponse();

WatchdogClass WD = WatchdogClass();

// スケッチを初期化します。
void setup() {
  delay(1000);
  xbee.begin(9600);
  pinMode(IR_OUT, OUTPUT);
  WD.systemResetEnable(false);
  WD.enable(WatchdogClass::TimeOut8s);
  pinMode(CHIP_SELECT, OUTPUT);
  pinMode(DEFAULT_CS, OUTPUT);
  
  // XBeeスリープ 
  pinMode(XBEE_SLEEP_PIN, OUTPUT);
  digitalWrite(XBEE_SLEEP_PIN, HIGH);
  
  // リセット確認用
  pinMode(8, OUTPUT);
  digitalWrite(8, HIGH);
  delay(10);
  digitalWrite(8, LOW);
  delay(10);
  digitalWrite(8, HIGH);
  delay(10);
  digitalWrite(8, LOW);
}

// 空調制御信号を送信します。
void sendSignal(byte signal[], int signalNum) {
  int count = 0;
  for (int i = 0; i < signalNum; i++) {
    unsigned long len = 0;
    
    byte sig = signal[i];
    if (sig > 128) {
      len = (sig - 128);
    } else {
      int bitIndex = 7;
      for (int j = 0; j < 7; j++) {
        bitWrite(len, bitIndex++, bitRead(sig, j));
      }
      len += (signal[++i] - 128);
    }

    len *= 10;
    if (len == 0) break;
    unsigned long us = micros();
    do {
      digitalWrite(IR_OUT, 1 - (count&1));
      delayMicroseconds(8);
      digitalWrite(IR_OUT, 0);
      delayMicroseconds(7);
    } while (long(us + len - micros()) > 0);
    count++;
  }
}

// VBエンコード
void vbEncode(byte *bytes, int number) {
  int num = number;
  int bytesIndex = 1;
  while (true) {
    bytes[bytesIndex] = num % 128;
    if (num < 128) break;
    bytesIndex--;
    num = num / 128;
  }
  bytes[1] += 128;
}

// 信号数をカウントします。
int countSignal(File file) {
  int count = 0;
  int bufIndex = 0;
  char buf[5] = {'\0'};
  while (file.available()) {
    char c = file.read();
    if (c == ',') {
      int sig = atoi(buf);
      // SDカードから読み込んだ信号を可変長バイト符号で保持するため
      if (sig >= 128) {
        count += 2;
      } else {
        count++;
      }
      for (int i = 0; i < 5; i++) buf[i] = '\0';
      bufIndex = 0;
    } else {
      buf[bufIndex] = c;
      bufIndex++;
    }
  }
  return count;
}

// SDカードから信号を読み込ます。
void readSignalSDCard(File file, byte *signal) {
  int sigIndex = 0;
  int bufIndex = 0;
  char buf[5] = {'\0'};
  while (file.available()) {
    char c = file.read();
    if (c == ',') {
      
      // 読み込んだ信号を可変長バイト符号化
      byte bytes[2] = {0};
      vbEncode(bytes, atoi(buf));
      
      for (int i = 0; i < 2; i++) {
        if (bytes[i] > 0) signal[sigIndex++] = bytes[i];
      }
      
      for (int i = 0; i < 5; i++) buf[i] = '\0';
      bufIndex = 0;
    } else {
      buf[bufIndex++] = c;
    }
  }
}

void loop() {  
  // XBeeをスリープから復帰
  pinMode(XBEE_SLEEP_PIN, OUTPUT);
  digitalWrite(XBEE_SLEEP_PIN, LOW);
  
  // XBeeの復帰所要時間
  delay(15);
  
  char recv[2] = {0};
  xbee.readPacket();
  if (xbee.getResponse().isAvailable()) {
    if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
      xbee.getResponse().getZBRxResponse(zbRx);

      // 空調制御番号を取得
      strncpy(recv, (char *)zbRx.getData(), sizeof(recv));
      int signalNo = atoi(recv); // 空調制御番号

      char fileName[9] = {0};
      fileName[0] = recv[0];
      strncpy(&fileName[1], "sig.csv", sizeof("sig.csv"));
      
      // 空調制御信号を取得
      SD.begin(CHIP_SELECT);
      File signalFile = SD.open(fileName);
      if (signalFile) {
        // 信号数をカウント
        int signalNum = countSignal(signalFile);
        
        // 信号保持用にメモリを確保
        byte *signal = (byte *)malloc(signalNum * sizeof(byte));
        if (signal == NULL) {
          signalFile.close();
          delay(10000);
          return;
        }
        
        // 信号数読み込みでシークが最後尾にあるため
        signalFile.seek(0);
        
        // 信号読み込み
        readSignalSDCard(signalFile, signal);

        signalFile.close();
    
        // 空調制御信号を送信
        sendSignal(signal, signalNum);
      
        free(signal);
        
        // プルアップを無効にしてリセットをかける
        pinMode(7, OUTPUT);
      }
    }
  }
  
  delay(100);
  
  // XBeeスリープ
  pinMode(XBEE_SLEEP_PIN, INPUT);
  digitalWrite(XBEE_SLEEP_PIN, HIGH);
  
  // Arduinoスリープ
  WatchdogClass::timerReset();
  SleepClass::powerDown();
}

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
int IR_IN = 2;

int last = 0;
unsigned long us = micros();

// セットアップ
void setup() {
  Serial.begin(115200);
  pinMode(IR_IN, INPUT);
}

void loop() {
  unsigned int val;
  unsigned int cnt = 0;
  
  while ((val = digitalRead(IR_IN)) == last) {
    if (++cnt >= 30000) {
      if (cnt == 30000) {
        Serial.print("\n");
      } else {
        cnt = 30000;
      }
    }
  }

  unsigned long us2 = micros();
  Serial.print((us2 - us) / 10, DEC);
  Serial.print(",");
  last = val;
  us = us2;
}

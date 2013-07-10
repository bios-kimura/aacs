<?php
/**
 * 温湿度データクラス
 *
 * The MIT License
 * 
 * Copyright (c) 2013 株式会社バイオス (http://www.bios-net.co.jp/index.html)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
    class TemperatureLog {
        private $filePath; // 温湿度データファイルパス
        
        public function __construct($filePath) {
            $this->filePath = $filePath;
        }
        
        /**
          * CSV形式の温湿度データを読み込み配列で返します。
          * 温湿度データファイルが存在しない場合は空の配列を返します。
          * @return array(
          *     'time' => 時刻,
          *     'theromo' => 温度配列,
          *     'hygro' => 湿度配列
          * )
          */
        public function read() {
            if (! file_exists($this->filePath)) {
                return array(
                    'time' => array(''),
                    'thermo' => array(''),
                    'hygro' => array('')
                );
            }
            
            $i = 0;
            $fp = fopen($this->filePath, 'r');
            if (flock($fp, LOCK_SH)) {
                while ($data = fgetcsv($fp)) {
                    // CSVには日付を予め書き込んでおり、
                    // 温度が空であれば温湿度データ無しとして次の参照する。
                    if (empty($data[1])) {
                        continue;
                    }
                    
                    $time[$i] = $data[0];
                    $thermo[$i] = $data[1];
                    $hygro[$i] = $data[2];
                    $i++;
                }
                flock($fp, LOCK_UN);
            } else {
                fclose($fp);
                return array(
                    'time' => array(''),
                    'thermo' => array(''),
                    'hygro' => array('')
                );
            }
            fclose($fp);
            
            return array(
                'time' => $time,
                'thermo' => $thermo,
                'hygro' => $hygro
            );
        }
    }
?>

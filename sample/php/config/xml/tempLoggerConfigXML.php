<?php
/*
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

    require_once('./log4php/Logger.php');
    Logger::configure('./log4php/log4php.properties');

    /**
      * XML形式の温湿度センサー設定クラス
      *
      */
    class TempLoggerConfigXML {
        private $filePath = null; // 各種設定ファイルパス
        private $logger;
        private $fileName = '-tempLoggerConfig.xml';
        
        public function __construct($filePath) {
            $this->filePath = $filePath;
            $this->logger = Logger::getLogger('logger');
        }

        /**
          * 温湿度センサー設定格納ディレクトリに存在するファイル名を返します。
          * 温湿度センサー設定ファイルが存在しない場合は空の配列を返します。
          * @return array array(ファイル名)
          */
        private function getFileNames() {
            $fileNames = array();
            if ($handle = opendir($this->filePath)) {
                while (false !== ($file = readdir($handle))) {
                  if ($file !== '.' && $file !== '..' && ! is_dir($this->filePath . $file)) {
                    $fileNames[] = $file;
                  }
                }
                closedir($handle);
            }
            return $fileNames;
        }
        
        /**
          * XML形式の温湿度センサー設定を読み込み配列で返します。
          * 温湿度センサー設定ファイルが存在しない場合は空の配列を返します。
          * @return array array(
          *                   'sensorId' => 温湿度センサー番号,
          *                   'sensorName' => 温湿度センサー名,
          *                   'date' => 日付
          *               )
          */
        public function allRead() {
            $fileNames = $this->getFileNames();
            // 温湿度センサー設定ファイルが1つも存在しない。
            if (count($fileNames) == 0) {
              return array(
                 array(
                  'sensorId' => '',
                  'sensorName' => '',
                  'date' => ''
                  )
              );
            }

            // 全ての温湿度センサー設定を取得
            $configArray = array();
            foreach ($fileNames as $fileName) {
                $array = array();
                $xml = simplexml_load_file($this->filePath . $fileName);
                foreach($xml -> sensor as $sensor) {
                    $array[] = array(
                      'sensorId' => (string)$sensor['id'],
                      'sensorName' => (string)$sensor->sensorName,
                      'date' => (string)$sensor->date
                    );
                }
                $configArray[] = $array;
            }
            return $configArray;
        }

        /**
          * 配列の温湿度センサー設定をXML形式で書き込みます。
          * 温湿度センサー設定ファイルが存在しない場合は作成します。
          * @param array $configArray  array(
          *                              array(
          *                                'sensorId' => 温湿度センサー番号,
          *                                'sensorName' => 温湿度センサー名
          *                              )
          *                            )
          *
          */
        public function entry($configArray) {
            foreach ($configArray as $sensor) {
                $this->entrySenor($sensor);
            }
        }

        /**
          * 指定した温湿度センサー情報をXMLファイルから削除します。
          * ファイルが存在すれば削除します。
          * @param string $deleteId 温湿度センサー番号
          */
        public function delete($sensorId) {
            if (file_exists($this->filePath . $sensorId . $this->fileName)) {
                unlink($this->filePath . $sensorId . $this->fileName);
            }
        }

        // 各温湿度センサー設定を保存します。
        private function entrySenor($sensor) {
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $xml = $dom->appendChild($dom->createElement('temepLogger'));

            // 温湿度センサー設定ファイルが存在する場合
            $this->logger->debug($sensor['sensorId']);
            if (file_exists($this->filePath . $sensor['sensorId'] . $this->fileName)) {
                $tempLoggerXml = simplexml_load_file($this->filePath . $sensor['sensorId'] . $this->fileName);
                foreach ($tempLoggerXml->sensor as $sensorXML) {
                    $this->createTag($dom, $xml, $sensorXML[0]['id'], $sensorXML->sensorName, $sensorXML->date);
                }
                $this->createTag($dom, $xml, $sensor['sensorId'], $sensor['sensorName'], date('Y/m/d'));
            } else {
                $this->createTag($dom, $xml, $sensor['sensorId'], $sensor['sensorName'], date('Y/m/d'));
            }

            file_put_contents($this->filePath . $sensor['sensorId'] . $this->fileName, $dom->saveXML(), LOCK_EX);
        }

        // 温湿度センサー設定を保持する新規タグを生成
        private function createTag($dom, $xml, $sensorId, $sensorName, $sensorDate) {
            $sensor = $xml->appendChild($dom->createElement('sensor'));
            $sensor->setAttribute('id', $sensorId);

            // 温湿度センサー名
            $name = $sensor->appendChild($dom->createElement('sensorName'));
            $name->appendChild($dom->createTextNode($sensorName));

            // 日付
            $date = $sensor->appendChild($dom->createElement('date'));
            $date->appendChild($dom->createTextNode($sensorDate));
        }
    }
?>
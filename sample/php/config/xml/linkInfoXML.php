<?php
/**
 * XML形式の温湿度センサーリンク情報クラス
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
    class LinkInfoXML {
        private $filePath;
        
        public function __construct($filePath) {
            $this->filePath = $filePath;
        }
        
        /**
          * XML形式の温湿度センサーリンク情報を読み込み配列で返します。
          * 温湿度センサーリンク情報ファイルが存在しない場合は空の配列を返します。
          * @return array array(
          *                 array(
          *                   'sensorId' => 温湿度センサー番号,
          *                   'controllerId' => コントローラー番号,
          *                   'surveillanceCycle' => 監視周期,
          *                   'maxTempLimitThreshold' => 温度上限値(限界値),
          *                   'minTempLimitThreshold' => 温度下限値(限界値),
          *                   'maxHygroLimitThreshold' => 湿度上限値(限界値),
          *                   'minHygroLimitThreshold' => 湿度下限値(限界値),
          *                   'latency' => 待機時間,
          *                   'maxTempCautionThreshold' => 温度上限値(警戒値),
          *                   'minTempCautionThreshold' => 温度下限値(警戒値),
          *                   'maxHygroCautionThreshold' => 湿度上限値(警戒値),
          *                   'minHygroCautionThreshold' => 湿度下限値(警戒値),
          *                   'isSend' =>  警報メール送信可否
          *                   )
          *               )
          */
        public function all_read() {
            if (! file_exists($this->filePath)) {
                return array(
                  array(
                    'sensorId' => '',
                    'controllerId' => '',
                    'surveillanceCycle' => '',
                    'maxTempLimitThreshold' => '',
                    'minTempLimitThreshold' => '',
                    'maxHygroLimitThreshold' => '',
                    'minHygroLimitThreshold' => '',
                    'latency' => '',
                    'maxTempCautionThreshold' => '',
                    'minTempCautionThreshold' => '',
                    'maxHygroCautionThreshold' => '',
                    'minHygroCautionThreshold' => '',
                    'isSend' => ''
                  )
                );
            }
            
            $array = array();
            $xml = simplexml_load_file($this->filePath);
            foreach($xml -> link as $link) {
                $array[] = array(
                  'sensorId' => (string)$link->sensor,
                  'controllerId' => (string)$link->controller,
                  'surveillanceCycle' => (string)$link->surveillanceCycle,
                  'maxTempLimitThreshold' => (string)$link->maxTempLimitThreshold,
                  'minTempLimitThreshold' => (string)$link->minTempLimitThreshold,
                  'maxHygroLimitThreshold' => (string)$link->maxHygroLimitThreshold,
                  'minHygroLimitThreshold' => (string)$link->minHygroLimitThreshold,
                  'latency' => (string)$link->latency,
                  'maxTempCautionThreshold' => (string)$link->maxTempCautionThreshold,
                  'minTempCautionThreshold' => (string)$link->minTempCautionThreshold,
                  'maxHygroCautionThreshold' => (string)$link->maxHygroCautionThreshold,
                  'minHygroCautionThreshold' => (string)$link->minHygroCautionThreshold,
                  'isSend' => (string)$link->isSend
                );
            }
            
            return $array;
        }
     
        /**
          * XML形式の温湿度センサーリンク情報を読み込み、
          * 温湿度センサー番号に一致すれば配列で返します。
          * 温湿度センサーリンク情報ファイルが存在しない、
          * 温湿度センサー番号に一致しない場合は空の配列を返します。
          * @param string $id 温湿度センサー番号
          * @return array array(
          *                   'sensorId' => 温湿度センサー番号,
          *                   'controllerId' => コントローラー番号,
          *                   'surveillanceCycle' => 監視周期,
          *                   'maxTempLimitThreshold' => 温度上限値(限界値),
          *                   'minTempLimitThreshold' => 温度下限値(限界値),
          *                   'maxHygroLimitThreshold' => 湿度上限値(限界値),
          *                   'minHygroLimitThreshold' => 湿度下限値(限界値),
          *                   'latency' => 待機時間,
          *                   'maxTempCautionThreshold' => 温度上限値(警戒値),
          *                   'minTempCautionThreshold' => 温度下限値(警戒値),
          *                   'maxHygroCautionThreshold' => 湿度上限値(警戒値),
          *                   'minHygroCautionThreshold' => 湿度下限値(警戒値),
          *                   'isSend' =>  警報メール送信可否
          *               )
          */
        public function read($id) {
            if (! file_exists($this->filePath)) {
                return array(
                    'sensorId' => '',
                    'controllerId' => '',
                    'surveillanceCycle' => '',
                    'maxTempLimitThreshold' => '',
                    'minTempLimitThreshold' => '',
                    'maxHygroLimitThreshold' => '',
                    'minHygroLimitThreshold' => '',
                    'latency' => '',
                    'maxTempCautionThreshold' => '',
                    'minTempCautionThreshold' => '',
                    'maxHygroCautionThreshold' => '',
                    'minHygroCautionThreshold' => '',
                    'isSend' => ''
                );
            }
            
            $array = array();
            $xml = simplexml_load_file($this->filePath);
            foreach($xml -> link as $link) {
                if ($id == (string)$link->sensor) {
                  return array(
                    'sensorId' => (string)$link->sensor,
                    'controllerId' => (string)$link->controller,
                    'surveillanceCycle' => (string)$link->surveillanceCycle,
                    'maxTempLimitThreshold' => (string)$link->maxTempLimitThreshold,
                    'minTempLimitThreshold' => (string)$link->minTempLimitThreshold,
                    'maxHygroLimitThreshold' => (string)$link->maxHygroLimitThreshold,
                    'minHygroLimitThreshold' => (string)$link->minHygroLimitThreshold,
                    'latency' => (string)$link->latency,
                    'maxTempCautionThreshold' => (string)$link->maxTempCautionThreshold,
                    'minTempCautionThreshold' => (string)$link->minTempCautionThreshold,
                    'maxHygroCautionThreshold' => (string)$link->maxHygroCautionThreshold,
                    'minHygroCautionThreshold' => (string)$link->minHygroCautionThreshold,
                    'isSend' => (string)$link->isSend
                  );
                }
            }
            
            return $array;
        }

        /**
          * 指定した温湿度センサーリンク情報をXMLファイルから削除します。
          * @param integer $deleteId 温湿度センサー番号
          */
        public function delete($deleteId) {
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $xml = $dom->appendChild($dom->createElement('links'));
            $linkInfoXml = simplexml_load_file($this->filePath);
            foreach($linkInfoXml -> link as $link) {
                $array = array(
                  'sensor' => (integer)$link->sensor == $deleteId ? $deleteId : (string)$link->sensor,
                  'controller' => (integer)$link->sensor == $deleteId ? 0 : (string)$link->controller,
                  'surveillanceCycle' => (integer)$link->sensor == $deleteId ? 0 : (string)$link->surveillanceCycle,
                  'maxTempLimitThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->maxTempLimitThreshold,
                  'minTempLimitThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->minTempLimitThreshold,
                  'maxHygroLimitThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->maxHygroLimitThreshold,
                  'minHygroLimitThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->minHygroLimitThreshold,
                  'latency' => (integer)$link->sensor == $deleteId ? 0 : (string)$link->latency,
                  'maxTempCautionThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->maxTempCautionThreshold,
                  'minTempCautionThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->minTempCautionThreshold,
                  'maxHygroCautionThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->maxHygroCautionThreshold,
                  'minHygroCautionThreshold' => (integer)$link->sensor == $deleteId ? 999 : (string)$link->minHygroCautionThreshold,
                  'isSend' => (integer)$link->sensor == $deleteId ? 0 : (string)$link->isSend,
                );

                // 温湿度センサー・リンク設定を生成
                $this->createTag($dom, $xml, $array);
            }
            file_put_contents($this->filePath, $dom->saveXML(), LOCK_EX);
        }
        
        /**
          * 配列の温湿度センサーリンク情報をXMLファイルに書き込みます。
          * 温湿度センサーリンク情報ファイルが存在しない場合は作成します。
          * @param array $configArray array(
          *                   'sensorId' => 温湿度センサー番号,
          *                   'controllerId' => コントローラー番号,
          *                   'surveillanceCycle' => 監視周期,
          *                   'maxTempLimitThreshold' => 温度上限値(限界値),
          *                   'minTempLimitThreshold' => 温度下限値(限界値),
          *                   'maxHygroLimitThreshold' => 湿度上限値(限界値),
          *                   'minHygroLimitThreshold' => 湿度下限値(限界値),
          *                   'latency' => 待機時間,
          *                   'maxTempCautionThreshold' => 温度上限値(警戒値),
          *                   'minTempCautionThreshold' => 温度下限値(警戒値),
          *                   'maxHygroCautionThreshold' => 湿度上限値(警戒値),
          *                   'minHygroCautionThreshold' => 湿度下限値(警戒値),
          *                   'isSend' =>  警報メール送信可否
          *              )
          *
          */
        public function entry($configArray) {
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $xml = $dom->appendChild($dom->createElement('links'));
            $linkInfoXml = simplexml_load_file($this->filePath);
            $isNewLinkInfo = true;
            foreach($linkInfoXml -> link as $link) {
                $array = array(
                  'sensor' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['sensorId'] : (string)$link->sensor,
                  'controller' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['controllerId'] : (string)$link->controller,
                  'surveillanceCycle' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['surveillanceCycle'] : (string)$link->surveillanceCycle,
                  'maxTempLimitThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['maxTempLimitThreshold'] : (string)$link->maxTempLimitThreshold,
                  'minTempLimitThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['minTempLimitThreshold'] : (string)$link->minTempLimitThreshold,
                  'maxHygroLimitThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['maxHygroLimitThreshold'] : (string)$link->maxHygroLimitThreshold,
                  'minHygroLimitThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['minHygroLimitThreshold'] : (string)$link->minHygroLimitThreshold,
                  'latency' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['latency'] : (string)$link->latency,
                  'maxTempCautionThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['maxTempCautionThreshold'] : (string)$link->maxTempCautionThreshold,
                  'minTempCautionThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['minTempCautionThreshold'] : (string)$link->minTempCautionThreshold,
                  'maxHygroCautionThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['maxHygroCautionThreshold'] : (string)$link->maxHygroCautionThreshold,
                  'minHygroCautionThreshold' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['minHygroCautionThreshold'] : (string)$link->minHygroCautionThreshold,
                  'isSend' => (integer)$link->sensor == (integer)$configArray['sensorId'] ? $configArray['isSend'] : (string)$link->isSend,
                );
                if ((integer)$link->sensor == (integer)$configArray['sensorId']) $isNewLinkInfo = false;

                // 温湿度センサー・リンク設定を生成
                $this->createTag($dom, $xml, $array);
            }
            if ($isNewLinkInfo) {
              $appendSensorLink = array(
                'sensor' => $configArray['sensorId'],
                'controller' => $configArray['controllerId'],
                'surveillanceCycle' => $configArray['surveillanceCycle'],
                'maxTempLimitThreshold' => $configArray['maxTempLimitThreshold'],
                'minTempLimitThreshold' => $configArray['minTempLimitThreshold'],
                'maxHygroLimitThreshold' => $configArray['maxHygroLimitThreshold'],
                'minHygroLimitThreshold' => $configArray['minHygroLimitThreshold'],
                'latency' => $configArray['latency'],
                'maxTempCautionThreshold' => $configArray['maxTempCautionThreshold'],
                'minTempCautionThreshold' => $configArray['minTempCautionThreshold'],
                'maxHygroCautionThreshold' => $configArray['maxHygroCautionThreshold'],
                'minHygroCautionThreshold' => $configArray['minHygroCautionThreshold'],
                'isSend' => $configArray['isSend']
              );
              $this->createTag($dom, $xml, $appendSensorLink);
            }
            file_put_contents($this->filePath, $dom->saveXML(), LOCK_EX);
        }

      // 新規タグを生成
      private function createTag($dom, $xml, $configArray) {
          $linkTag = $xml->appendChild($dom->createElement('link'));

          // 温湿度センサー番号
          $sensorTag = $linkTag->appendChild($dom->createElement('sensor'));
          $sensorTag->appendChild($dom->createTextNode($configArray['sensor']));

          // 空調制御コントローラー番号
          $controllerTag = $linkTag->appendChild($dom->createElement('controller'));
          $controllerTag->appendChild($dom->createTextNode($configArray['controller']));

          // 監視周期
          $surveillanceCycleTag = $linkTag->appendChild($dom->createElement('surveillanceCycle'));
          $surveillanceCycleTag->appendChild($dom->createTextNode($configArray['surveillanceCycle']));

          // 限界値
          $maxTempLimitThresholdTag = $linkTag->appendChild($dom->createElement('maxTempLimitThreshold'));
          $maxTempLimitThresholdTag->appendChild($dom->createTextNode($configArray['maxTempLimitThreshold']));
          $minTempLimitThresholdTag = $linkTag->appendChild($dom->createElement('minTempLimitThreshold'));
          $minTempLimitThresholdTag->appendChild($dom->createTextNode($configArray['minTempLimitThreshold']));
          $maxHygroLimitThresholdTag = $linkTag->appendChild($dom->createElement('maxHygroLimitThreshold'));
          $maxHygroLimitThresholdTag->appendChild($dom->createTextNode($configArray['maxHygroLimitThreshold']));
          $minHygroLimitThresholdTag = $linkTag->appendChild($dom->createElement('minHygroLimitThreshold'));
          $minHygroLimitThresholdTag->appendChild($dom->createTextNode($configArray['minHygroLimitThreshold']));

          // 待機時間
          $latencyTag = $linkTag->appendChild($dom->createElement('latency'));
          $latencyTag->appendChild($dom->createTextNode($configArray['latency']));

          // 警戒値
          $maxTempCautionThresholdTag = $linkTag->appendChild($dom->createElement('maxTempCautionThreshold'));
          $maxTempCautionThresholdTag->appendChild($dom->createTextNode($configArray['maxTempCautionThreshold']));
          $minTempCautionThresholdTag = $linkTag->appendChild($dom->createElement('minTempCautionThreshold'));
          $minTempCautionThresholdTag->appendChild($dom->createTextNode($configArray['minTempCautionThreshold']));
          $maxHygroCautionThresholdTag = $linkTag->appendChild($dom->createElement('maxHygroCautionThreshold'));
          $maxHygroCautionThresholdTag->appendChild($dom->createTextNode($configArray['maxHygroCautionThreshold']));
          $minHygroCautionThresholdTag = $linkTag->appendChild($dom->createElement('minHygroCautionThreshold'));
          $minHygroCautionThresholdTag->appendChild($dom->createTextNode($configArray['minHygroCautionThreshold']));

          // 警報メール送信可否
          $isSendTag = $linkTag->appendChild($dom->createElement('isSend'));
          $isSendTag->appendChild($dom->createTextNode($configArray['isSend']));
      }
    }

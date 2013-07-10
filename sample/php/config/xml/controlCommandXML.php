<?php
/*
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

    require_once('./log4php/Logger.php');
    Logger::configure('./log4php/log4php.properties');
    
    /**
      * XML形式の空調制御コマンドクラス
      *
      */
    class ControlCommandXML {
        private $filePath;
        private $logger;
        
        public function __construct($filePath) {
            $this->filePath = $filePath;
            $this->logger = Logger::getLogger('logger');
        }
        
        /**
          * XML形式の空調制御コマンドを読み込み配列で返します。
          * 空調制御コマンドファイルが存在しない場合は空の配列を返します。
          * コントローラー番号が一致する空調制御コマンドが存在しない場合は空の配列を返します。
          * @param integer $id = コントローラー番号
          * @return array (
          *                 array(
          *                     'commandId' => 空調制御コマンド番号,
          *                     'commandName' => 空調制御コマンド名,
          *                     'signal' => 空調制御信号
          *                 )
          *              )
          */
        public function read() {
            if (! file_exists($this->filePath)) {
                return array(
                        array(
                          'commandId' => '',
                          'commandName' => '',
                          'signal' => ''
                        )
                );
            }
            
            $array = array();
            if ($handle = opendir($this->filePath)) {

                while (false !== ($file = readdir($handle))) {
                    if ($file != "." && $file != "..") {
                        $xmlPath = $this->filePath . '\\' . $file;
                        $xml = simplexml_load_file($xmlPath);
                        $this->logger->debug($file);
                        $this->logger->debug($xml['id']);
                        $array[] = array(
                            'commandId' => (string)$xml['id'],
                            'commandName' => (string)$xml->commandName,
                            'signal' => (string)$xml->signal
                        );
                    }
                }

                closedir($handle);
            }
            
            return $array;
        }
        
        /**
          * 配列の空調制御コマンドをXMLファイルに書き込みます。
          * 空調制御コマンドファイルが存在しない場合は作成します。
          * @param array $configArray  array(
          *          array(
          *            'commandId' => 空調制御コマンド番号,
          *            'commandName' => 空調制御コマンド名,
          *            'signal' => 空調制御信号
          *          )
          *        )
          */
        public function update($configArray) {
            $configLength = count($configArray);
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $root = $dom->appendChild($dom->createElement('controlCommand'));
            for ($i = 0; $i < $configLength; $i++) {
                $command = $root->appendChild($dom->createElement('command'));
                $command->setAttribute('id', $configArray[$i]['commandId']);
                $commandName = $command->appendChild($dom->createElement('commandName'));
                $commandName->appendChild($dom->createTextNode($configArray[$i]['commandName']));
                $signal = $command->appendChild($dom->createElement('signal'));
                $signal->appendChild($dom->createTextNode($configArray[$i]['signal']));
            }
            file_put_contents($this->filePath, $dom->saveXML(), LOCK_EX);
        }

        /*
         * 空調制御信号を登録します。
         * @param string $commandId 空調制御信号を登録するコマンドの番号
         * @param string $signal 空調制御信号
         */
        public function entryCommand($commandId, $signal) {
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $xml = $dom->appendChild($dom->createElement('controlCommand'));
            $controlXml = simplexml_load_file($this->filePath);
            foreach ($controlXml->command as $commandXML) {
                $commandTag = $xml->appendChild($dom->createElement('command'));
                $commandTag->setAttribute('id', (string)$commandXML['id']);
                $commandNameTag = $commandTag->appendChild($dom->createElement('commandName'));
                $commandNameTag->appendChild($dom->createTextNode((string)$commandXML->commandName));
                if ($commandId === (string)$commandXML['id']) {
                    $signalTag = $commandTag->appendChild($dom->createElement('signal'));
                    $signalTag->appendChild($dom->createTextNode($signal));
                } else {
                    $signalTag = $commandTag->appendChild($dom->createElement('signal'));
                    $signalTag->appendChild($dom->createTextNode((string)$commandXML->signal));
                }
            }
            file_put_contents($this->filePath, $dom->saveXML(), LOCK_EX);
        }

        /**
          * 指定した空調制御コマンドをXMLファイルから削除します。
          * ファイルが存在すれば削除します。
          * @param array $array array(
          *          array(
          *            'commandId' => 空調制御コマンド番号,
          *            'commandName' => 空調制御コマンド名,
          *            'signal' => 空調制御信号
          *          )
          *                           )
          * @param string $deleteCommandId コマンド番号
          */
        public function delete($array, $deleteCommandId) {
            $configLength = count($array);
            $dom = new DomDocument('1.0');
            $dom->encoding = 'UTF-8';
            $dom->formatOutput = true;
            $xml = $dom->appendChild($dom->createElement('controlCommand'));
            for ($i = 0; $i < $configLength; $i++) {
                // 削除対象のコマンドは書き込まない
                if ($deleteCommandId === $array[$i]['commandId']) continue;

                // 空調制御コマンドタグ作成
                $commandTag = $xml->appendChild($dom->createElement('command'));
                $commandTag->setAttribute('id', $array[$i]['commandId']);
                $commandNameTag = $commandTag->appendChild($dom->createElement('commandName'));
                $commandNameTag->appendChild($dom->createTextNode($array[$i]['commandName']));
                $signal = $commandTag->appendChild($dom->createElement('signal'));
                $signal->appendChild($dom->createTextNode($array[$i]['signal']));
            }
            file_put_contents($this->filePath, $dom->saveXML(), LOCK_EX);
        }
    }

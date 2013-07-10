<?php
/**
 * 空調制御コントローラー画面を扱うモジュール
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

    require_once('./config/controller.php');
    
    /**
      * 空調制御コントローラーコマンド画面クラス
      *
      */
    class ControllerCommand extends Controller {
        private $controllerCommandXML;
        private $controllerCommandSD;
        private $controlCommandXML;
        private $linkInfoXML;
        private $deleteId; // 削除ID
        private $configArray; // 設定の配列

        /**
         * コンストラクタ
         */
        public function __construct($configArray, $deleteId) {
            parent::__construct();
            $this->configArray = $configArray;
            $this->deleteId = $deleteId;
            require_once('./config/xml/controllerCommandXML.php');
            $this->controllerCommandXML = new ControllerCommandXML('../config/controllerCommand/');
            require_once('./config/xml/LinkInfoXml.php');
            $this->linkInfoXML = new LinkInfoXML('../config/linkInfo.xml');
            require_once('./config/xml/controlCommandXML.php');
            $this->controlCommandXML = new ControlCommandXML('../config/controlCommand/');
            require_once('./config/sd/controllerCommandSD.php');
            $this->controllerCommandSD = new ControllerCommandSD('F:\\');
        }

        /**
         * リクエストを処理します。
         */
        public function execute() {
            $sensorId = null;
            if (isset($_POST['sensorId'])) {
                $sensorId = (int)$_POST['sensorId'];
            }

            // 空調制御コマンドを取得
            if (! empty($sensorId)) {
                $this->getControllerCommand($sensorId);
                return;
            }
            
            // 空調制御コマンドを削除
            if (! empty($this->configArray) && ! empty($this->deleteId)) {
                $this->deleteControllerCommand();
                return;
            }
            
            // 空調制御コマンドを登録
            if (! empty($this->configArray) && empty($this->deleteId)) {
                $this->entryControllerCommand();
                return;
            }
            
            $this->logger->error('該当なし');
        }

        /**
         * 空調制御コマンドを取得します。
         */
        private function getControllerCommand($sensorId) {
            $this->logger->debug('空調制御コマンドを取得するコントローラーとリンクする温湿度センサー: ' . $sensorId);
            
            // 温湿度センサーリンク情報を取得
            $linkInfo = $this->linkInfoXML->read($sensorId);
            
            $controllerId = $linkInfo['controllerId'];
            $this->logger->debug('空調制御コマンドを取得するコントローラー: ' . $controllerId);
            
            // 空調制御コマンドを取得
            $controllerCommand = $this->controllerCommandXML->read($controllerId);
            $this->logger->debug($controllerCommand);
            
            if (count($controllerCommand) === 0) {
              $controllerCommand = array(
                array(
                  'controllerId' => $controllerId,
                  'controllerCommandId' => '',
                  'commandId' => ''
                )
              );
            }

            echo json_encode($controllerCommand);
        }

        /**
         * 空調制御コマンドを削除します。
         */
        private function deleteControllerCommand() {
            $this->logger->debug('削除コマンド: ' . $this->deleteId);
            $this->logger->debug('空調制御コマンド設定');
            $this->logger->debug($this->configArray);
            $this->controllerCommandXML->delete($this->configArray, $this->deleteId);
        }

        /**
         * 空調制御コマンドを登録します。
         */
        private function entryControllerCommand() {
            $this->logger->debug('コントローラー番号: ' . $this->configArray[0]['controllerId'] . 'のコマンドを登録します。');
            $this->logger->debug($this->configArray);
            
            // 空調制御番号を書き込み
            $this->controllerCommandXML->entry($this->configArray);
            
            // 空調制御信号をSDカードに書き込み
            $controlCommands = $this->controlCommandXML->read();
            $this->controllerCommandSD->writeCsv($this->configArray, $controlCommands);
        }
    }
?>
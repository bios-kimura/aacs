<?php
/**
 * 空調制御コントローラー設定画面を扱うモジュール
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
      * 空調制御コントローラー設定画面クラス
      *
      */
    class ControllerConfig extends Controller {
        private $controllerConfigXML;
        private $deleteId; // 削除ID
        private $configArray; // 設定の配列
        
        /**
         * コンストラクタ
         */
        public function __construct($configArray, $deleteId) {
            parent::__construct();
            $this->configArray = $configArray;
            $this->deleteId = $deleteId;
            require_once('./config/xml/controllerConfigXML.php');
            $this->controllerConfigXML = new ControllerConfigXML('../config/controllerConfig.xml');
        }

        /**
         * リクエストを処理します。
         */
        public function execute() {
            $this->logger->debug($this->configArray);
            // 空調制御コントローラー設定を取得
            if (empty($this->configArray) && empty($this->deleteId)) {
                $this->getControllerConfig();
                return;
            }

            // 空調制御コントローラー設定を削除
            if (! empty($this->configArray) && ! empty($this->deleteId)) {
                $this->deleteControllerConfig();
                return;
            }
            
            // 空調制御コントローラー設定を登録
            if (! empty($this->configArray) && empty($this->deleteId)) {
                $this->entryControllerConfig();
                return;
            }

            $this->logger->error('該当なし');
        }
        
        /**
         * 空調制御コントローラー設定を取得します。
         */
        private function getControllerConfig() {
            $this->logger->debug('空調制御コントローラー設定取得');
            $array = $this->controllerConfigXML->read();
            if (count($array) === 0) {
              $array[] = array(
                'controllerId' => '',
                'xbee' => ''
              );
            }
            echo json_encode($array);
        }

          /**
         * 空調制御コントローラー設定を削除します。
         */
        private function deleteControllerConfig() {
            $this->logger->debug('削除する空調制御コントローラー: ' . $this->deleteId);
            $this->logger->debug($this->configArray);
            $this->controllerConfigXML->delete($this->configArray, $this->deleteId);
        }

        /**
         * 空調制御コントローラー設定を登録します。
         */
        private function entryControllerConfig() {
            // 全角数字を半角に変換
            $this->convertHalfWidthNumber();

            $this->logger->debug('登録する空調制御コントローラー設定: ' . $this->configArray);
            $this->controllerConfigXML->update($this->configArray);
        }

        /**
         * 全角数字の場合は半角数字に変換します。
         */
        private function convertHalfWidthNumber() {
            $num = count($this->configArray);
            for ($i = 0; $i < $num; $i++) {
                $xbee = $this->configArray[$i]['xbee'];
                $this->configArray[$i]['xbee'] = mb_convert_kana($xbee, 'a', 'utf-8');
            }
        }
    }
?>
<?php
/**
 * 空調制御コマンド画面を扱うモジュール
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
      * 空調制御コマンド画面クラス
      *
      */
    class ControlCommand extends Controller {
        private $controlCommandXML;
        private $deleteId; // 削除ID
        private $configArray; // 設定の配列
        
        /**
         * コンストラクタ
         * @param array $configArray 空調制御コマンド
         * @param string $deleteId 削除する空調制御コマンドの番号
         */
        public function __construct($configArray, $deleteId) {
            parent::__construct();
            $this->configArray = $configArray;
            $this->deleteId = $deleteId;
            require_once('./config/xml/controlCommandXML.php');
            $this->controlCommandXML = new ControlCommandXML('../config/controlCommand/');
        }

        /**
         * リクエストを処理します。
         */
        public function execute() {
            $entryId = null;
            if (isset($_POST['entryId'])) {
                $entryId = $_POST['entryId'];
            }
            
            // 空調制御コマンドを取得
            if (empty($this->configArray) && empty($entryId) && empty($this->deleteId)) {
                $this->getControlCommand();
                return;
            }
            
            // 空調制御コマンドを削除
            if (! empty($this->configArray) && empty($entryId) && ! empty($this->deleteId)) {
                $this->deleteControlCommand();
                return;
            }
            
            // 空調制御コマンドを登録
            if (! empty($this->configArray) && ! empty($entryId) && empty($this->deleteId)) {
                $this->entryControlCommand($entryId);
                return;
            }
            
            $this->logger->error('該当なし');
        }
        
        /**
         * 空調制御コマンドを取得します。
         */
        private function getControlCommand() {
            $commands = $this->controlCommandXML->read();
            $this->logger->debug('空調制御コマンドを取得');
            echo json_encode($commands);
        }

        /**
         * 空調制御コマンドを削除します。
         */
        private function deleteControlCommand() {
            $this->logger->debug('削除コマンド: ' . $this->deleteId);
            $this->logger->debug($this->configArray);
            $this->controlCommandXML->delete($this->configArray, $this->deleteId);
        }

        /**
         * 空調制御コマンドを登録します。
         * @param string $entryId 登録する空調制御コマンドの番号
         */
        private function entryControlCommand($entryId) {
            $this->logger->debug('登録コマンド: ' . $entryId);
            $this->logger->debug($this->configArray);
            
            // 空調制御コマンドの登録
            $this->controlCommandXML->update($this->configArray);
        }
    }
?>
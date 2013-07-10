<?php
/**
 * システム設定画面を扱うモジュール
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
      * システム設定画面クラス
      *
      */
    class SystemConfig extends Controller {
        private $systemConfigXML;
        private $deleteId; // 削除ID
        private $configArray; // 設定の配列
        
        /**
         * コンストラクタ
         */
        public function __construct($configArray, $deleteId) {
            parent::__construct();
            $this->configArray = $configArray;
            $this->deleteId = $deleteId;
            require_once('./config/xml/systemConfigXML.php');
            $this->systemConfigXML = new SystemConfigXML('../config/systemConfig.xml');
        }

        /**
         * リクエストを処理します。
         */
        public function execute() {
            //$this->logger->debug($this->configArray);
            // システム設定を取得
            if (empty($this->configArray) && empty($this->deleteId)) {
                $this->getSystemConfig();
                return;
            }
            
            // システム設定を削除
            if (! empty($this->configArray) && ! empty($this->deleteId)) {
                $this->deleteSystemConfig();
                return;
            }
            
            // システム設定を登録
            if (! empty($this->configArray) && empty($this->deleteId)) {
                $this->entrySystemConfig();
                return;
            }
            
            $this->logger->error('該当なし');
        }

        /**
         * システム設定を取得します。
         */
        private function getSystemConfig() {
            $this->logger->debug('システム設定を取得');
            $systemConfig = $this->systemConfigXML->read();

            echo json_encode($systemConfig);
        }

        /**
         * システム設定を削除します。
         */
        private function deleteSystemConfig() {
            $this->logger->debug('削除するシステム設定: ' . $this->deleteId);
            $this->configArray[$this->deleteId] = '';
            $this->systemConfigXML->update($this->configArray);
        }

        /**
         * システム設定を登録します。
         */
        private function entrySystemConfig() {
            // 入力チェック(全角数字を半角に変換)
            $this->checkHalfWidthNumber();

            $this->logger->debug('登録するシステム設定: ' . $this->configArray);
            $this->systemConfigXML->update($this->configArray);
        }

        /**
         * 半角数字であるかチェックします。
         * 全角数字の場合は半角数字に変換します。
         */
        private function checkHalfWidthNumber() {
            // メール送信元
            $from = $this->configArray['from'];
            if (! preg_match("/^[0-9]+$/", $from)) {
                $this->configArray['from'] = mb_convert_kana($from, 'n', 'utf-8');
            }

            // メール送信元
            $to = $this->configArray['to'];
            if (! preg_match("/^[0-9]+$/", $to)) {
                $this->configArray['to'] = mb_convert_kana($to, 'n', 'utf-8');
            }

            // SMTP
            $smtp = $this->configArray['smtp'];
            if (! preg_match("/^[0-9]+$/", $smtp)) {
                $this->configArray['smtp'] = mb_convert_kana($smtp, 'n', 'utf-8');
            }

            // ユーザ
            $user = $this->configArray['user'];
            if (! preg_match("/^[0-9]+$/", $user)) {
                $this->configArray['user'] = mb_convert_kana($user, 'n', 'utf-8');
            }

            // パスワード
            $passwd = $this->configArray['passwd'];
            if (! preg_match("/^[0-9]+$/", $passwd)) {
                $this->configArray['passwd'] = mb_convert_kana($passwd, 'n', 'utf-8');
            }

            // SMTPポート
            $port = $this->configArray['port'];
            if (! preg_match("/^[0-9]+$/", $port)) {
                $this->configArray['port'] = mb_convert_kana($port, 'n', 'utf-8');
            }

            // コーディネータCOMポート
            $cordinator = $this->configArray['cordinator'];
            if (! preg_match("/^[0-9]+$/", $cordinator)) {
                $this->configArray['cordinator'] = mb_convert_kana($cordinator, 'n', 'utf-8');
            }

            // 赤外線受信機COMポート
            $irReceive = $this->configArray['irReceive'];
            if (! preg_match("/^[0-9]+$/", $irReceive)) {
                $this->configArray['irReceive'] = mb_convert_kana($irReceive, 'n', 'utf-8');
            }
        }
    }
?>
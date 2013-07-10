<?php
/**
 * 空調制御状態を扱うモジュール
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
      * 空調制御状態を扱うクラス
      *
      */
    class ControllerState extends Controller {
        private $controllerStateXML;
        
        /**
         * コンストラクタ
         */
        public function __construct() {
            parent::__construct();
            require_once('./config/xml/controllerStateXML.php');
            $this->controllerStateXML = new ControllerStateXML('../config/controllerState.xml');
        }

        /**
         * リクエストを処理します。
         */
        public function execute() {
            // 空調制御状態を取得
            $controllerId = null;
            if (isset($_POST['controllerId'])) {
                $controllerId = $_POST['controllerId'];    
            }

            if (! empty($controllerId)) {
                $this->read($controllerId);
                return;
            }
        }
        
        /**
          * 空調制御状態を読み込み配列で返します。
          * 空調制御状態ファイルが存在しない場合は空の配列を返します。
          * @param string $controllerId コントローラー番号
          * @return array(
          *                 'controllerId' => コントローラー番号,
          *                 'sentCommand' => 最後に送信したコマンド番号,
          *                 'surveillanceCount' => 監視回数,
          *                 'latencyCount' => 待機回数
          *                 'sentCommandCount' => 空調制御コマンド送信後の監視回数
          *             )
          */
        public function read($controllerId) {
            $this->logger->debug('制御状態取得コントローラー番号' . $controllerId);
            $controllerState = $this->controllerStateXML->read($controllerId);
            $this->logger->debug($controllerState);
            echo json_encode($controllerState);
        }
    }

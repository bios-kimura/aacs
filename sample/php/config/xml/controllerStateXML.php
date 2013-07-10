<?php
/**
 * XML形式の空調制御状態を扱うクラス
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

    class ControllerStateXML {
        private $logger;

        public function __construct($filePath) {
            $this->filePath = $filePath;
            $this->logger = Logger::getLogger('logger');
        }
        
        /**
          * XML形式の空調制御状態を読み込み配列で返します。
          * 空調制御状態ファイルが存在しない場合は空の配列を返します。
          * @param string $id コントローラー番号
          * @return array array(
          *                 'controllerId' => コントローラー番号,
          *                 'sentCommand' => 送信したコマンド,
          *                 'surveillanceCount' => 監視回数,
          *                 'latencyCount' => 待機回数
          *                 'sentCommandCount' => コマンド送信後の監視回数
          *               )
          */
        public function read($id) {
            if (! file_exists($this->filePath)) {
                return array(
                        'controllerId' => '',
                        'sentCommand' => '',
                        'surveillanceCount' => '',
                        'latencyCount' => '',
                        'sentCommandCount' => ''
                );
            }
            
            $array = array();
            $xml = simplexml_load_file($this->filePath);
            foreach($xml -> controller as $controller) {
                if ($id == (string)$controller['id']) {
                    $array['controllerId'] = (string)$controller['id'];
                    $array['sentCommand'] = (string)$controller->sentCommand;
                    $array['surveillanceCount'] = (string)$controller->surveillanceCount;
                    $array['latencyCount'] = (string)$controller->sentCommandCount;
                    break;
                }
            }
            

            return $array;
        }
    }

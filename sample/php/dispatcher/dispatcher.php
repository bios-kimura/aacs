<?php
/**
 * クライアントからのリクエストを振り分けるモジュール
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
      * クライアントからのリクエストを扱うクラス
      */
    class Dispatcher {
        private $logger;
        
        public function __construct() {
            $this->logger = Logger::getLogger('logger');
        }
        
        /**
          * リクエストの振り分けを行います。
          */
        public function dispatch() {
            // POST値の存在確認
            $target = null;
            $deleteId = null;
            $configArray = null;
            if (isset($_POST['target'])) {
                $target = $_POST['target'];    
            }
            if (isset($_POST['deleteId'])) {
                $deleteId = $_POST['deleteId'];    
            }
            if (isset($_POST['configArray'])) {
                $configArray = $_POST['configArray'];    
            }
            
            $this->logger->debug('target:' . $target);
            
            switch ($target) {
                case 'TempLogger':
                    // 温湿度データ
                    $this->dispatchTempLogger();
                    break;
                case 'TempLoggerConfig':
                    // 温湿度センサー設定
                    $this->dispatchTempLoggerConfig($configArray, $deleteId);
                    break;
                case 'ControllerConfig':
                    // 空調制御設定
                    $this->dispatchControllerConfig($configArray, $deleteId);
                    break;
                case 'LinkInfo':
                    // 温湿度センサーリンク情報
                    $this->dispatchLinkInfo($configArray, $deleteId);
                    break;
                case 'SystemConfig':
                    // システム設定
                    $this->dispatchSystemConfig($configArray, $deleteId);
                    break;
                case 'ControlCommand':
                    // 空調制御コマンド
                    $this->dispatchControlCommand($configArray, $deleteId);
                    break;
                case 'ControllerCommand':
                    // 空調制御コントローラーコマンド
                    $this->dispatchControllerCommand($configArray, $deleteId);
                    break;
                case 'ControllerState':
                    // 空調制御状態
                    $this->dispatchControllerState();
                    break;
                case 'SendCommand':
                    // 空調制御コマンド
                    $this->dispatchSendCommand();
                    break;
            }
        }

        /**
         * 温湿度データを読み込みます。
         */
        private function dispatchTempLogger() {
            $sensorId = $_POST['sensorId'];
            $date = $_POST['date'];
            
            // 温湿度データの読み込み
            if (! empty($sensorId) && ! empty($date)) {
                $this->logger->debug('温湿度センサー番号: ' . $sensorId . ', 日付: ' . $date);
                
                list($year, $month, $day) = explode('/', $date);
                $filePath = '../log/ThermoHygro/' . $year . '/sensor' . $sensorId . '/' . $sensorId . '-' . $month . $day . '.csv';
                $this->logger->debug('読み込む温湿度データパス: ' . $filePath);

                require_once('./sensor/temperatureLog.php');
                $tl = new TemperatureLog($filePath);
                $tempArray = $tl->read();
                
                echo json_encode($tempArray);
                return;
            }
            $this->logger->error('該当なし');
        }

        /**
         * 温湿度センサー設定を扱うクラスに処理を振り分けます。
         */
        private function dispatchTempLoggerConfig($configArray, $deleteId) {
            require_once('./config/tempLoggerConfig.php');
            $tlc = new TempLoggerConfig($configArray, $deleteId);
            $tlc->execute();
        }

        /**
         * 空調制御コントローラー設定を扱うクラスに処理を振り分けます。
         */
        private function dispatchControllerConfig($configArray, $deleteId) {
            require_once('./config/controllerConfig.php');
            $cc = new ControllerConfig($configArray, $deleteId);
            $cc->execute();
        }

        /**
         * 温湿度センサーリンク情報を扱うクラスに処理を振り分けます。
         */
        private function dispatchLinkInfo($configArray, $deleteId) {
            require_once('./config/linkInfo.php');
            $li = new LinkInfo($configArray, $deleteId);
            $li->execute();
        }

        /**
         * システム設定を扱うクラスに処理を振り分けます。
         */
        private function dispatchSystemConfig($configArray, $deleteId) {
            require_once('./config/systemConfig.php');
            $sc = new SystemConfig($configArray, $deleteId);
            $sc->execute();
        }

        /**
         * 空調制御コマンドを扱うクラスに処理を振り分けます。
         */
        private function dispatchControlCommand($configArray, $deleteId) {
            require_once './config/controlCommand.php';
            $cc = new ControlCommand($configArray, $deleteId);
            $cc->execute();
        }


        /**
         * 空調制御コントローラーコマンドを扱うクラスに処理を振り分けます。
         */
        private function dispatchControllerCommand($configArray, $deleteId) {
            require_once './config/controllerCommand.php';
            $cc = new ControllerCommand($configArray, $deleteId);
            $cc->execute();
        }

        /**
         * 空調制御状態を扱うクラスに処理を振り分けます。
         */
        private function dispatchControllerState() {
            require_once './config/controllerState.php';
            $cs = new ControllerState();
            $cs->execute();
        }

        /**
         * 空調制御コマンド送信処理へソケット通信で空調制御コマンド送信のリクエストをします。
         * リクエストは./python/socketcommand/socket_command.pyで受け取ります。
         * ホスト: localhost、ポート: 2002
         */
        private function dispatchSendCommand() {
            //$sensorId = $_POST['sensorId'];
            $sendCommand = $_POST['sendCommand'];
            $controllerId = $_POST['controllerId'];
            
            // 空調制御コマンド送信
            if (! empty($sendCommand) && ! empty($controllerId)) {
                $this->logger->debug('コントローラー番号: ' . $controllerId . ', 送信コマンド: ' . $sendCommand);
                $sock = fsockopen('localhost', 2002, $errorno, $errstatus, 5);
                if (!$sock) {
                    fclose($sock);
                    $this->logger->error('ソケットの取得に失敗しました。');
                    throw new Exception("ソケットの取得に失敗しました。");
                    return;
                }

                $json = json_encode(
                    array(
                        'controllerId' => $controllerId,
                        'sendCommand' => $sendCommand
                    )
                );
                fwrite($sock, $json);
                fclose($sock);
                return;
            }
        }
    }

?>

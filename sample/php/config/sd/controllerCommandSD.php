<?php
/**
 * 空調制御コントローラーコマンドクラス
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

    class ControllerCommandSD {
        private $filePath;
        private $logger;
        
        public function __construct($filePath) {
            $this->filePath = $filePath;
            $this->logger = Logger::getLogger('logger');
        }
        
        /**
         * SDカードにCSV形式で空調制御信号を書き込みます。
         * 空調制御信号No, 空調制御信号
         * @param array $controllerCommands 空調制御コントローラーコマンド設定
         * @param array $controlCommands 空調制御コマンド設定
         */
        public function writeCsv($controllerCommands, $controlCommands) {
            if (! is_dir($this->filePath)) {
                throw new Exception('SDカードを接続してください。');
            }

            $controllerNum = count($controllerCommands);
            $controlNum = count($controlCommands);
            $controllerId = intval($controllerCommands[0]['controllerId'], 10);

            $this->logger->debug('コントローラー数:' . $controllerNum);
            $this->logger->debug('ID:' . $controllerId);
            $this->logger->debug('信号数:' . $controlNum);
            
            //for ($i = 0; $i < $controllerNum; $i++) {
                for ($j = 0; $j < $controlNum; $j++) {
                    if ($controllerCommands[$controllerId]['commandId'] == $controlCommands[$j]['commandId']) {
                        $fileName = $controllerCommands[$controllerId]['controllerId'] . 'sig.csv';
                        $fp = fopen($this->filePath . $fileName, 'ab+');
                        if (flock($fp, LOCK_EX)) {
                          ftruncate($fp, 0);
                          fwrite($fp, $controlCommands[$j]['signal']);
                        } else {
                          throw new Exception('SDカードのロックに失敗しました。');
                        }
                        fclose($fp);
                        break;
                    }
                }
            //}
        }
    }
?>
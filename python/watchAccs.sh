#!/bin/sh

# 定期的にプロセスを監視し、ダウンしている場合にメール通知と再起動を行う

while true
do
	isAlive=`ps -ef | grep "airconditioner_controller.py" | grep -v grep | wc -l`

	if [ $isAlive = 0 ]; then
		echo `date` ": not alive process" >> watchAccs.log
		python ./python/airconditioner_controller.py
		python ./python/mail/fatal_error_mail.py
	fi

	sleep 3600

done

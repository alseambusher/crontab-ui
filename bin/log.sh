 ID = $1
 CRONPATH = $2
log_folder

 if test -f /tmp/7ANZAyPKmrx0CsS6.stderr
  then date >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.log"
  cat /tmp/7ANZAyPKmrx0CsS6.stderr >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.log"
 fi
 if test -f /tmp/7ANZAyPKmrx0CsS6.stdout
  then date >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.stdout.log"
  cat /tmp/7ANZAyPKmrx0CsS6.stdout >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.stdout.log"
 fi
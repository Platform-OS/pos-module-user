set -eu

DEFAULT_ENV=""
POS_ENV="${1:-$DEFAULT_ENV}"

pos-cli data clean $POS_ENV --auto-confirm --include-schema

pos-cli deploy $POS_ENV
cd ./tests/post_import
env CONFIG_FILE_PATH=./../../.pos pos-cli data import --path=./../data/seed/data.zip --zip $POS_ENV
env CONFIG_FILE_PATH=./../../.pos pos-cli deploy -p $POS_ENV

для сборки с препроцессором scss:

git clone git@github.com:yeffasol/new.git -b scss project && cd project

для сборки с postcss: 

git clone git@github.com:yeffasol/new.git project && cd project



git remote add origin git@github.com:yeffasol/project.git >/dev/null 2>&1 || git remote set-url origin git@github.com:yeffasol/project.git

npm i

npm run start для сборки development

npm run build для сборки production

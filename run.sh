# instalar serverless-framework
npm install -g serverless

# inicilizar serverless-framework
sls

# sempre fazer deploy antes de tudo
# para verificar se está com ambiente ok
sls deploy

# invoke na AWS
sls invoke -f image-analysis

# invoke local e mostrar logs
sls invoke local -f image-analysis
sls logs -f image-analysis

# configurar o dashboard
sls

# fica aguardando logs de uma função 
sls logs -f image-analysis --tail

# delete tudo do serverless-framework
sls remove
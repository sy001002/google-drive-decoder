const baseUrl = 'https://drive.google.com';

function getView(id) {
   return `${baseUrl}/file/d/${id}/view`;
}

function getDownload(id) {
   return `${baseUrl}/uc?id=${id}&export=download`;
}

function getConfirm(id, confirm) {
   return `${baseUrl}/uc?id=${id}&export=download&confirm=${confirm}`;
}

module.exports = {
   getView,
   getDownload,
   getConfirm
};

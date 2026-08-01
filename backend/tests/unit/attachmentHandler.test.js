/**
 * Tests for chat attachment uploads.
 *
 * The paperclip in the chat window had no handler and SendMessage hardcodes
 * type: "text", so there was no path for an image or a document at all. These
 * cover the parts of the new path that decide whether a file is accepted, and
 * the two failure modes that matter: refusing what should not be shared, and
 * never leaving a file on disk without the message that owns it.
 */

const path = require('path');
const fs = require('fs');

const {
  attachmentUpload,
  handleAttachmentErrors,
  MAX_BYTES,
} = require('../../middleware/AttachmentHandler');

/** multer keeps the filter on the instance; call it as multer would. */
const runFilter = (mimetype) =>
  new Promise((resolve) => {
    const filter = attachmentUpload.fileFilter;
    filter({}, { mimetype, originalname: 'x' }, (err, accepted) =>
      resolve({ err, accepted })
    );
  });

describe('attachment upload configuration', () => {
  it('caps uploads at 10 MB', () => {
    expect(MAX_BYTES).toBe(10 * 1024 * 1024);
    expect(attachmentUpload.limits.fileSize).toBe(MAX_BYTES);
  });

  it.each([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
  ])('accepts %s', async (mime) => {
    const { err, accepted } = await runFilter(mime);
    expect(err).toBeNull();
    expect(accepted).toBe(true);
  });

  it.each([
    'application/x-msdownload',
    'application/x-sh',
    'text/html',
    'application/javascript',
  ])('refuses %s', async (mime) => {
    const { err, accepted } = await runFilter(mime);
    expect(err).toBeInstanceOf(Error);
    expect(accepted).toBe(false);
  });

  it('creates its upload directory, because multer will not', () => {
    // uploads/ is git-ignored, so on a fresh clone this path does not exist
    // and every upload would fail with ENOENT.
    const dir = path.join(__dirname, '..', '..', 'uploads', 'attachments');
    expect(fs.existsSync(dir)).toBe(true);
  });
});

describe('attachment error handling', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  it('explains a file that is too large in the terms the user set it in', () => {
    const res = mockRes();
    handleAttachmentErrors({ code: 'LIMIT_FILE_SIZE' }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('10 MB') })
    );
  });

  it('passes the rejected-type message through', () => {
    const res = mockRes();
    handleAttachmentErrors(new Error('That file type cannot be shared here.'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'That file type cannot be shared here.' })
    );
  });

  it('stands aside when there is no error', () => {
    const res = mockRes();
    const next = jest.fn();
    handleAttachmentErrors(null, {}, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

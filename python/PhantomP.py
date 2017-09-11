import cv2
import sys


def faceDetection(img):
    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(img, 1.3, 3)
    for (x, y, w, h) in faces:
        faces = img[y:y+h, x:x+w]
    return faces


def comic(img, d=5, c=20):
    num_bilateral = 7
    img_color = img
    for _ in xrange(num_bilateral):
        img_color = cv2.bilateralFilter(img_color, d=d, sigmaColor=c, sigmaSpace=d)

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blur = cv2.blur(gray, (5, 5))
    edge = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 7, 7)

    img_edge = cv2.cvtColor(edge, cv2.COLOR_GRAY2RGB)
    img_comic = cv2.bitwise_and(img_color, img_edge)
    return img_comic


def binary(img):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    ret, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return th


def main():
    src = sys.argv[1]
    dst = sys.argv[2]
    image = cv2.imread(src)
    pp = binary(comic(image))
    cv2.imwrite(dst, pp)
if __name__ == '__main__':
    main()

# img_color0 = cv2.imread('/root/Pictures/image_0170.jpg')
# img0 = cv2.cvtColor(img_color0, cv2.COLOR_BGR2GRAY)
# cv2.imshow('testC', comic(img_color0))
# cv2.imshow('testB', binary(comic(img_color0)))
# cv2.waitKey()

# Linux centos LVM分区挂盘

Linux centos LVM（逻辑卷管理）分区挂盘是一种在Linux centos系统中管理磁盘的有效方式。使用LVM，可以创建逻辑卷并将它们视为独立的分区。LVM的优点在于，可以在不影响系统运行的情况下轻松更改逻辑卷的大小。

以下是创建LVM分区并将其挂载到Linux centos系统

以下是步骤：

1. 首先，创建一个新的物理分区。可以通过使用 `fdisk` 命令来完成。
2. 接下来，在新创建的分区上创建物理卷。可以通过使用 `pvcreate` 命令来完成。例如: `pvcreate /dev/sdb`。
3. 然后，创建卷组。可以通过使用 `vgcreate` 命令来完成。例如: `vgcreate vgdata /dev/sdb`。
4. 之后，从卷组中创建逻辑卷。可以通过使用 `lvcreate` 命令来完成。例如: `lvcreate -l 100%FREE -n lv_data vgdata`。
5. 最后，在逻辑卷上创建文件系统，然后将其挂载到系统。可以通过使用 `mkfs` 和 `mount` 命令来完成。例如: `mkfs.xfs /dev/vgdata/lv_data`。

以上就是在Linux centos系统中创建LVM分区并将其挂载的步骤。请注意，这些步骤需要root权限才能执行。